"""LLM response generation via NVIDIA NIM (Llama) — grounded, cited, zero-hallucination."""
from __future__ import annotations

import asyncio
import json
import logging

from app.models.schemas import QueryResponse
from app.services import llm_client

logger = logging.getLogger(__name__)

SYSTEM_PROMPT = """You are WeatherGPT, a trusted weather assistant for India built for the Ministry of Earth Sciences.
Rules you MUST follow:
1. Base your answer ONLY on the weather data and RAG context provided. Never invent numbers.
2. ALWAYS include citations array in your JSON response with at least one entry.
3. If weather data is missing, say so honestly. Never guess weather values.
4. Keep answers concise, practical, and actionable for your user's context
   (farmer, fisherman, disaster manager, researcher, pilot, urban planner).
5. Response must be in English — translation happens after.
6. For aviation queries: include QNH, visibility, wind speed/direction if available.
7. For marine queries: include wave height, swell period, wind direction,
   and fishing zone safety status if available.
8. For fisherman queries: explicitly state whether it is SAFE or UNSAFE to go to sea,
   citing wave height and wind speed thresholds from IMD Fishermen Alert bulletins.
9. Return ONLY valid JSON. No markdown, no preamble."""

FISHERMEN_WAVE_THRESHOLD_M = 2.5
FISHERMEN_WIND_THRESHOLD_KMH = 45


def _fishing_zone_safe(weather_data: dict) -> bool | None:
    wave = weather_data.get("wave_height_m")
    wind = weather_data.get("wind_speed_kmh")
    if wave is None or wind is None:
        return None
    return not (wave > FISHERMEN_WAVE_THRESHOLD_M and wind > FISHERMEN_WIND_THRESHOLD_KMH)


def _fallback_response(weather_data: dict, nlp_result: dict, gfs_data: list[dict]) -> dict:
    """Deterministic, source-grounded response used when NVIDIA_API_KEY is unset."""
    location = weather_data.get("location", "your location")
    date = weather_data.get("date", "the requested date")
    condition = weather_data.get("condition", "unknown")
    rainfall = weather_data.get("rainfall_mm", 0)
    use_case = nlp_result.get("use_case_context", "general")

    citations = [{
        "source": weather_data.get("source", "IMD OpenAPI"),
        "detail": f"Live observation/forecast for {location} on {date}",
        "url": weather_data.get("source_url", "https://mausam.imd.gov.in"),
    }]
    if gfs_data:
        citations.append({
            "source": "GFS (via Open-Meteo)",
            "detail": f"GFS NWP forecast, {gfs_data[0].get('run_time')}",
            "url": gfs_data[0].get("source_url", "https://api.open-meteo.com/v1/forecast"),
        })

    fishing_safe = _fishing_zone_safe(weather_data) if use_case == "fisherman" else None
    answer = f"In {location} on {date}, expect {condition.lower()} with {rainfall}mm rainfall."
    if fishing_safe is not None:
        answer += " SAFE to go to sea." if fishing_safe else " UNSAFE — do not venture into the sea."

    return {
        "answer": answer,
        "citations": citations,
        "weather_summary": {
            "location": location,
            "date": date,
            "rainfall_mm": rainfall,
            "condition": condition,
            "nwp_model": "GFS" if gfs_data else None,
            "wave_height_m": weather_data.get("wave_height_m"),
            "fishing_zone_safe": fishing_safe,
            "coastal_zone": weather_data.get("coastal_zone"),
        },
        "alert_level": "warning" if weather_data.get("cyclone_warning") else (
            "advisory" if weather_data.get("heatwave_warning") else "none"
        ),
        "use_case_context": use_case,
    }


async def generate(weather_data: dict, rag_chunks: list[dict], nlp_result: dict, gfs_data: list[dict]) -> dict:
    if not llm_client.is_configured():
        return _fallback_response(weather_data, nlp_result, gfs_data)

    try:
        context = {
            "weather_data": weather_data,
            "rag_context": rag_chunks,
            "gfs_data": gfs_data,
            "query": nlp_result.get("en_text"),
            "intent": nlp_result.get("intent"),
            "use_case_context": nlp_result.get("use_case_context"),
        }
        raw = await asyncio.to_thread(
            llm_client.chat_completion, SYSTEM_PROMPT, json.dumps(context), 1800
        )
        parsed = json.loads(raw)

        # Some NVIDIA-hosted models (esp. vision-capable ones) wrap JSON
        # output in a content-block shape — {"type": "text", "text": {...}}
        # — instead of the flat object we asked for. Unwrap it.
        if set(parsed.keys()) == {"type", "text"} and isinstance(parsed.get("text"), dict):
            parsed = parsed["text"]

        if not parsed.get("answer"):
            raise ValueError("LLM response missing 'answer' field after unwrap")

        if not parsed.get("citations"):
            parsed["citations"] = []
        default_citation_url = weather_data.get("source_url", "https://mausam.imd.gov.in")
        for citation in parsed["citations"]:
            citation.setdefault("detail", f"{citation.get('source', 'source')} data for {weather_data.get('location', 'this location')}")
            citation.setdefault("url", default_citation_url)
        if not parsed["citations"]:
            parsed["citations"] = [{
                "source": weather_data.get("source", "IMD"),
                "detail": "fallback citation — LLM omitted citations",
                "url": default_citation_url,
            }]

        if not parsed.get("weather_summary"):
            parsed["weather_summary"] = {"location": weather_data.get("location"), "date": weather_data.get("date")}
        # Validate against the response schema — the LLM's JSON can be
        # well-formed but still miss required fields (e.g. citation
        # detail/url); catch that here rather than letting it crash the
        # route as an unhandled Pydantic ValidationError (500, no CORS
        # headers on the error response, browser reports "Failed to fetch").
        validated = QueryResponse(**parsed)
        return validated.model_dump()
    except Exception as e:
        logger.warning(f"NVIDIA LLM generation failed, using grounded fallback: {e}")
        return _fallback_response(weather_data, nlp_result, gfs_data)
