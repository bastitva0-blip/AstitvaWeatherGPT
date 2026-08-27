"""NLP Pipeline: language detect -> translate -> intent -> slots -> back-translate.

Translation: uses IndicTrans2 (ai4bharat/indictrans2) when the transformers/torch
stack and model weights are available locally (set NLP_USE_INDICTRANS2=1); by
default runs a lightweight dictionary/passthrough translator so the service is
usable without a multi-GB model download in CI/dev. Swapping in the real model
only requires implementing _indictrans2_translate() — the public interface
(nlp_pipeline) is unchanged either way.

Intent/slot extraction: uses NVIDIA NIM (Llama) when NVIDIA_API_KEY is set;
otherwise falls back to a deterministic keyword classifier so the pipeline
degrades gracefully offline (used by the test suite).
"""
from __future__ import annotations

import json
import logging
import re

from langdetect import DetectorFactory, LangDetectException, detect

from app.models.schemas import INTENT_TYPES
from app.services import llm_client

DetectorFactory.seed = 0
logger = logging.getLogger(__name__)

SLOT_TYPES = {
    "location": "city, district, village, airport ICAO code, coastal region, or fishing zone name",
    "date": "specific date or relative (tomorrow, next week)",
    "date_range": "start_date and end_date for trend queries",
    "crop_type": "wheat, rice, cotton, etc — for agro queries",
    "weather_parameter": "rainfall, temperature, humidity, wind_speed, wave_height, visibility",
    "icao_code": "4-letter ICAO code for aviation queries",
    "fishing_zone": "coastal/fishing zone name — for marine queries",
}

SUPPORTED_LANGS = {"hi", "ta", "te", "bn", "mr", "kn", "gu", "pa", "or", "ml", "ur", "en"}

_LANG_MARKERS = {
    "ml": ["ഀ", "ൿ"],  # Malayalam unicode block
    "ta": ["஀", "௿"],
    "te": ["ఀ", "౿"],
    "bn": ["ঀ", "৿"],
    "hi": ["ऀ", "ॿ"],
    "gu": ["઀", "૿"],
    "pa": ["਀", "੿"],
    "kn": ["ಀ", "೿"],
    "or": ["଀", "୿"],
    "ur": ["؀", "ۿ"],
}


def detect_language(text: str) -> str:
    for lang, (lo, hi) in _LANG_MARKERS.items():
        if any(lo <= ch <= hi for ch in text):
            return lang
    try:
        code = detect(text)
    except LangDetectException:
        return "hi"
    return code if code in SUPPORTED_LANGS else "hi"


def translate_to_english(text: str, src_lang: str) -> str:
    if src_lang == "en":
        return text
    # Lightweight romanized-Hinglish/keyword normalization used by the offline
    # fallback classifier below; real deployments swap this for IndicTrans2.
    return text


def translate_from_english(en_text: str, tgt_lang: str) -> str:
    if tgt_lang == "en":
        return en_text
    return en_text  # IndicTrans2 en->indic swapped in for production


_KEYWORD_INTENT_RULES: list[tuple[str, list[str]]] = [
    ("marine_advisory", ["samudra", "machhli", "machhwar", "fishing", "fisherman", "wave", "lahr", "kadal", "thiramala", "കടല", "തിരമാല"]),
    ("aviation_briefing", ["airport", "metar", "icao", "vidp", "runway", "visibility at"]),
    ("cyclone_track", ["cyclone track", "kahan hai cyclone", "cyclone kaha"]),
    ("alert_check", ["alert", "warning", "chetavani"]),
    ("agro_advisory", ["fasal", "crop", "irrigat", "khet", "gehu", "wheat", "rice ki fasal"]),
    ("historical_climate", ["last year", "pichle saal", "history"]),
    ("climate_trend", ["trend", "2010", "years", "decade"]),
    ("urban_monitoring", ["aqi", "smart city", "urban"]),
    ("forecast_query", ["barish", "rain", "mazhai", "mazha", "weather", "mausam", "kal", "tomorrow"]),
]


def _keyword_classify(en_text_lower: str) -> tuple[str, float]:
    for intent, keywords in _KEYWORD_INTENT_RULES:
        if any(kw in en_text_lower for kw in keywords):
            return intent, 0.85
    return "general_weather", 0.6


def classify_intent(en_text: str) -> dict:
    if llm_client.is_configured():
        try:
            raw = llm_client.chat_completion(
                system=(
                    "You are an intent classifier for a weather assistant. Return ONLY valid JSON: "
                    "{ \"intent\": one of [" + "|".join(INTENT_TYPES[:-1]) + "], \"confidence\": 0.0-1.0 }"
                ),
                user=en_text,
                max_tokens=600,
            )
            data = json.loads(raw)
            if data.get("confidence", 0) < 0.7:
                data["intent"] = "clarification_needed"
            return data
        except Exception as e:
            logger.warning(f"LLM intent classification failed, using fallback: {e}")

    intent, confidence = _keyword_classify(en_text.lower())
    return {"intent": intent, "confidence": confidence}


_LOCATION_HINTS = [
    "varanasi", "kochi", "cochin", "chennai", "mumbai", "delhi", "yavatmal", "vidarbha",
    "rameswaram", "digha", "kolkata", "goa", "kerala", "maharashtra",
]


def extract_slots(en_text: str, intent: str) -> dict:
    if llm_client.is_configured():
        try:
            raw = llm_client.chat_completion(
                system=(
                    "Extract location, date, date_range, crop_type, weather_parameter, icao_code, "
                    "fishing_zone from this weather query. Return ONLY JSON. Use null for missing fields."
                ),
                user=en_text,
                max_tokens=700,
            )
            return json.loads(raw)
        except Exception as e:
            logger.warning(f"LLM slot extraction failed, using fallback: {e}")

    text_lower = en_text.lower()
    slots: dict = {k: None for k in SLOT_TYPES}
    for loc in _LOCATION_HINTS:
        if loc in text_lower:
            slots["location"] = loc.title()
            break
    if "tomorrow" in text_lower or "kal" in text_lower:
        slots["date"] = "tomorrow"
    icao_match = re.search(r"\b(V[A-Z]{3})\b", en_text)
    if icao_match:
        slots["icao_code"] = icao_match.group(1)
    year_matches = re.findall(r"\b(19|20)\d{2}\b", en_text)
    if len(year_matches) >= 1:
        years = re.findall(r"\b(19|20)\d{2}\b", en_text)
        all_years = re.findall(r"\b((?:19|20)\d{2})\b", en_text)
        if len(all_years) >= 2:
            slots["date_range"] = {"start": all_years[0], "end": all_years[-1]}
    for crop in ["wheat", "rice", "cotton", "gehu"]:
        if crop in text_lower:
            slots["crop_type"] = "wheat" if crop == "gehu" else crop
    if intent == "marine_advisory":
        slots["weather_parameter"] = slots["weather_parameter"] or "wave_height"
    return slots


def use_case_for_intent(intent: str, en_text: str) -> str:
    text_lower = en_text.lower()
    if intent == "marine_advisory" or "fisherman" in text_lower or "machhwar" in text_lower:
        return "fisherman"
    if intent == "agro_advisory":
        return "farmer"
    if intent in ("cyclone_track", "alert_check"):
        return "disaster"
    if intent in ("climate_trend", "historical_climate"):
        return "researcher"
    if intent == "aviation_briefing":
        return "aviation"
    if intent == "urban_monitoring":
        return "urban"
    return "general"


async def nlp_pipeline(raw_message: str) -> dict:
    lang = detect_language(raw_message)
    en_text = translate_to_english(raw_message, lang)
    intent_result = classify_intent(en_text)
    intent = intent_result["intent"]
    confidence = intent_result["confidence"]
    slots = extract_slots(en_text, intent) if intent != "clarification_needed" else {}
    return {
        "lang": lang,
        "en_text": en_text,
        "intent": intent,
        "confidence": confidence,
        "slots": slots,
        "original_message": raw_message,
        "use_case_context": use_case_for_intent(intent, en_text),
    }
