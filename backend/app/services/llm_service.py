"""LLM response generation via NVIDIA NIM (Llama) — grounded, cited, zero-hallucination.

Design: the LLM is used ONLY to write the natural-language answer sentence,
never to produce structured facts (citations, weather_summary, alert_level).
Those are always assembled in code directly from weather_data/gfs_data — the
same real API responses regardless of whether the LLM call succeeds. This
was a deliberate change after testing showed small instruction-tuned models
on NVIDIA NIM are unreliable at strict JSON schemas (wrapping output in
content-block shapes) and can even invent a plausible-looking but fabricated
citation URL when asked to produce citations themselves. Splitting the
concerns removes both failure modes: the LLM's job (short text generation)
is one it's actually good at and fast at, and every fact in the response is
guaranteed to trace back to a real API call, never the model's imagination.
"""
from __future__ import annotations

import asyncio
import logging

from app.services import llm_client

logger = logging.getLogger(__name__)

FISHERMEN_WAVE_THRESHOLD_M = 2.5
FISHERMEN_WIND_THRESHOLD_KMH = 45

ANSWER_SYSTEM_PROMPT = """You are WeatherGPT, a weather assistant for India built for the Ministry of Earth Sciences.
Write ONE short, natural, practical sentence (max 2 sentences) answering the user's query,
using ONLY the weather facts given to you below — never invent or add numbers, locations,
or conditions not present in those facts. Plain text only, no JSON, no markdown, no preamble.
Safety-critical rule: the "Fishing zone safe" fact is a pre-computed verdict from IMD wave/wind
thresholds — you MUST use its exact value (True = SAFE, False = UNSAFE) if it is not None, and
MUST NOT independently judge safety from the wind/wave numbers yourself. If it is None, say
there isn't enough data to judge sea safety — do not guess SAFE or UNSAFE."""


def _fishing_zone_safe(weather_data: dict) -> bool | None:
    wave = weather_data.get("wave_height_m")
    wind = weather_data.get("wind_speed_kmh")
    if wave is None or wind is None:
        return None
    return not (wave > FISHERMEN_WAVE_THRESHOLD_M and wind > FISHERMEN_WIND_THRESHOLD_KMH)


def _build_citations(weather_data: dict, gfs_data: list[dict]) -> list[dict]:
    citations = [{
        "source": weather_data.get("source", "IMD OpenAPI"),
        "detail": f"Live observation/forecast for {weather_data.get('location', 'this location')} "
                  f"on {weather_data.get('date', 'the requested date')}",
        "url": weather_data.get("source_url", "https://mausam.imd.gov.in"),
    }]
    if gfs_data:
        citations.append({
            "source": "GFS (via Open-Meteo)",
            "detail": f"GFS NWP forecast, {gfs_data[0].get('run_time')}",
            "url": gfs_data[0].get("source_url", "https://api.open-meteo.com/v1/forecast"),
        })
    return citations


def _build_facts(weather_data: dict, nlp_result: dict, gfs_data: list[dict]) -> dict:
    """Everything in the response except `answer` — always code-derived, never LLM output."""
    use_case = nlp_result.get("use_case_context", "general")
    fishing_safe = _fishing_zone_safe(weather_data) if use_case == "fisherman" else None
    return {
        "citations": _build_citations(weather_data, gfs_data),
        "weather_summary": {
            "location": weather_data.get("location"),
            "date": weather_data.get("date"),
            "rainfall_mm": weather_data.get("rainfall_mm"),
            "condition": weather_data.get("condition"),
            "nwp_model": "GFS" if gfs_data else None,
            "wave_height_m": weather_data.get("wave_height_m"),
            "fishing_zone_safe": fishing_safe,
            "coastal_zone": weather_data.get("coastal_zone"),
        },
        "alert_level": "warning" if weather_data.get("cyclone_warning") else (
            "advisory" if weather_data.get("heatwave_warning") else "none"
        ),
        "use_case_context": use_case,
        "fishing_safe": fishing_safe,
    }


def _deterministic_answer(weather_data: dict, fishing_safe: bool | None) -> str:
    location = weather_data.get("location", "your location")
    date = weather_data.get("date", "the requested date")
    condition = (weather_data.get("condition") or "unknown").lower()
    rainfall = weather_data.get("rainfall_mm", 0)
    answer = f"In {location} on {date}, expect {condition} with {rainfall}mm rainfall."
    if fishing_safe is not None:
        answer += " SAFE to go to sea." if fishing_safe else " UNSAFE — do not venture into the sea."
    return answer


async def generate(weather_data: dict, rag_chunks: list[dict], nlp_result: dict, gfs_data: list[dict]) -> dict:
    facts = _build_facts(weather_data, nlp_result, gfs_data)
    fishing_safe = facts.pop("fishing_safe")

    answer = None
    if llm_client.is_configured():
        try:
            facts_summary = (
                f"Location: {weather_data.get('location')}, Date: {weather_data.get('date')}, "
                f"Condition: {weather_data.get('condition')}, Rainfall: {weather_data.get('rainfall_mm')}mm "
                f"({weather_data.get('rainfall_probability')} probability), "
                f"Temperature: {weather_data.get('temperature_min')}-{weather_data.get('temperature_max')}C, "
                f"Humidity: {weather_data.get('humidity_percent')}%, "
                f"Wind: {weather_data.get('wind_speed_kmh')}km/h {weather_data.get('wind_direction')}, "
                f"Visibility: {weather_data.get('visibility_km')}km, "
                f"Wave height: {weather_data.get('wave_height_m')}m, "
                f"Cyclone warning: {weather_data.get('cyclone_warning')}, "
                f"Heatwave warning: {weather_data.get('heatwave_warning')}, "
                f"Fishing zone safe: {fishing_safe}, "
                f"Use case: {nlp_result.get('use_case_context')}, "
                f"User query: {nlp_result.get('en_text')}"
            )
            raw = await asyncio.to_thread(
                llm_client.chat_completion, ANSWER_SYSTEM_PROMPT, facts_summary, 150
            )
            answer = raw.strip().strip('"')
        except Exception as e:
            logger.warning(f"NVIDIA LLM answer generation failed, using deterministic answer: {e}")

    if not answer:
        answer = _deterministic_answer(weather_data, fishing_safe)

    return {"answer": answer, **facts}
