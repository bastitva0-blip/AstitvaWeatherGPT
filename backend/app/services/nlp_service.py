"""NLP Pipeline: language detect -> translate -> intent -> slots -> back-translate.

Translation: uses the NVIDIA NIM LLM as a translator when NVIDIA_API_KEY is
set (real translation, not a stub) — falls back to passthrough offline so the
test suite stays fast and network-free.

Intent/slot extraction: deterministic keyword classifier, always — kept off
the LLM path entirely. Two extra sequential LLM round-trips here (in addition
to the final answer-generation call) were the dominant source of end-to-end
latency (~13-15s/query against a reasoning model); the keyword classifier is
instant and was already the tested fallback, so this is a straight win, not
a quality tradeoff on the hot path. The LLM's reasoning budget is spent once,
on the grounded final answer, where it matters.
"""
from __future__ import annotations

import logging
import re

from langdetect import DetectorFactory, LangDetectException, detect

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


_LANG_NAMES = {
    "hi": "Hindi", "ta": "Tamil", "te": "Telugu", "bn": "Bengali", "mr": "Marathi",
    "kn": "Kannada", "gu": "Gujarati", "pa": "Punjabi", "or": "Odia", "ml": "Malayalam",
    "ur": "Urdu", "en": "English",
}


def translate_to_english(text: str, src_lang: str) -> str:
    if src_lang == "en":
        return text
    if not llm_client.is_configured():
        return text  # offline/test fallback — keyword classifier below tolerates romanized input
    try:
        lang_name = _LANG_NAMES.get(src_lang, src_lang)
        return llm_client.chat_completion(
            system=(
                f"Translate the user's {lang_name} weather query to English. "
                "Return ONLY the translated text, no quotes, no explanation."
            ),
            user=text,
            max_tokens=300,
            temperature=0.0,
        ).strip()
    except Exception as e:
        logger.warning(f"Translation to English failed, using original text: {e}")
        return text


def translate_from_english(en_text: str, tgt_lang: str) -> str:
    if tgt_lang == "en":
        return en_text
    if not llm_client.is_configured():
        return en_text
    try:
        lang_name = _LANG_NAMES.get(tgt_lang, tgt_lang)
        return llm_client.chat_completion(
            system=(
                f"Translate this weather assistant answer to {lang_name}. "
                "Keep numbers, place names, and units unchanged. "
                "Return ONLY the translated text, no quotes, no explanation."
            ),
            user=en_text,
            max_tokens=400,
            temperature=0.0,
        ).strip()
    except Exception as e:
        logger.warning(f"Translation from English failed, returning English text: {e}")
        return en_text


_KEYWORD_INTENT_RULES: list[tuple[str, list[str]]] = [
    ("marine_advisory", ["samudra", "machhli", "machhwar", "fishing", "fisherm", "wave height", "high waves", "lahr", "kadal", "thiramala", "sea", "coastal", "കടല", "തിരമാല"]),
    ("aviation_briefing", ["airport", "metar", "icao", "vidp", "runway", "visibility at"]),
    ("cyclone_track", ["cyclone track", "kahan hai cyclone", "cyclone kaha"]),
    ("alert_check", ["alert", "warning", "chetavani"]),
    ("agro_advisory", ["fasal", "crop", "irrigat", "khet", "gehu", "wheat", "rice ki fasal"]),
    ("historical_climate", ["last year", "pichle saal", "history"]),
    ("climate_trend", ["trend", "2010", "years", "decade"]),
    ("urban_monitoring", ["aqi", "smart city", "urban"]),
    ("forecast_query", ["barish", "rain", "mazhai", "mazha", "weather", "mausam", "kal", "tomorrow"]),
]


# Deliberately partial stems (match "fisherman"/"fishermen"/"irrigation" etc)
# — matched with a leading \b but no trailing \b. Every other single-word
# keyword requires a full \bword\b match.
_STEM_KEYWORDS = {"fisherm", "irrigat", "machhwar"}


def _keyword_classify(en_text_lower: str) -> tuple[str, float]:
    # Word-boundary matching — a plain substring check would match "wave"
    # inside "heatwave" or "sea" inside "season"/"disease", misrouting the
    # intent (this misrouted a Jaisalmer heatwave query to marine_advisory
    # in testing).
    for intent, keywords in _KEYWORD_INTENT_RULES:
        for kw in keywords:
            if " " in kw:
                if kw in en_text_lower:
                    return intent, 0.85
            elif kw in _STEM_KEYWORDS:
                if re.search(rf"\b{re.escape(kw)}", en_text_lower):
                    return intent, 0.85
            elif re.search(rf"\b{re.escape(kw)}\b", en_text_lower):
                return intent, 0.85
    return "general_weather", 0.6


def classify_intent(en_text: str) -> dict:
    intent, confidence = _keyword_classify(en_text.lower())
    return {"intent": intent, "confidence": confidence}


# Common capitalized words that are NOT place names — excluded so the
# proper-noun heuristic below doesn't misfire on ordinary sentence-starts
# or weather vocabulary. This intentionally does NOT try to whitelist
# Indian place names (that approach silently fails on remote/small towns
# not on the list, e.g. Leh, Itanagar, Cherrapunji) — instead any
# capitalized phrase is treated as a location candidate and left for
# gis_service.resolve_location() (real geocoding) to confirm or reject.
_LOCATION_STOPWORDS = {
    "will", "is", "are", "was", "were", "what", "when", "where", "how", "should",
    "can", "could", "would", "do", "does", "did", "please", "tell", "show", "give",
    "kal", "tomorrow", "today", "yesterday", "gfs", "imd", "india", "indian",
    "weather", "rain", "rainfall", "temperature", "humidity", "wind", "cyclone",
    "monsoon", "climate", "trend", "vidp", "vabb", "vecc", "safe", "unsafe",
}


def _extract_location(en_text: str) -> str | None:
    candidates = re.findall(r"\b[A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+)*\b", en_text)
    for candidate in candidates:
        first_word = candidate.split()[0].lower()
        if first_word in _LOCATION_STOPWORDS:
            continue
        return candidate
    return None


def _extract_location_llm(en_text: str) -> str | None:
    """LLM fallback for when the proper-noun regex finds nothing — covers
    casually-typed lowercase queries ("will it be sunny in lucknow") and
    any place name worldwide, not just capitalized Indian towns. Only
    called when the fast regex path comes up empty, so it doesn't add
    latency to the common well-formed-capitalization case."""
    if not llm_client.is_configured():
        return None
    try:
        raw = llm_client.chat_completion(
            system=(
                "Extract the place name (city, town, region, or landmark) mentioned in this "
                "weather query, anywhere in the world. Reply with ONLY the place name, "
                "properly capitalized, nothing else. If no place is mentioned, reply NONE."
            ),
            user=en_text,
            max_tokens=30,
            temperature=0.0,
        ).strip().strip('"')
        if not raw or raw.upper() == "NONE":
            return None
        return raw
    except Exception as e:
        logger.warning(f"LLM location extraction failed: {e}")
        return None


def extract_slots(en_text: str, intent: str) -> dict:
    text_lower = en_text.lower()
    slots: dict = {k: None for k in SLOT_TYPES}
    slots["location"] = _extract_location(en_text)
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
    if intent == "marine_advisory" or "fisherm" in text_lower or "machhwar" in text_lower:
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
    import asyncio

    lang = detect_language(raw_message)
    en_text = await asyncio.to_thread(translate_to_english, raw_message, lang)
    intent_result = classify_intent(en_text)
    intent = intent_result["intent"]
    confidence = intent_result["confidence"]
    slots = extract_slots(en_text, intent) if intent != "clarification_needed" else {}
    if intent != "clarification_needed" and not slots.get("location"):
        slots["location"] = await asyncio.to_thread(_extract_location_llm, en_text)
    return {
        "lang": lang,
        "en_text": en_text,
        "intent": intent,
        "confidence": confidence,
        "slots": slots,
        "original_message": raw_message,
        "use_case_context": use_case_for_intent(intent, en_text),
    }
