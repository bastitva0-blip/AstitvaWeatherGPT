from datetime import datetime
from typing import Any, Literal

from pydantic import BaseModel

INTENT_TYPES = [
    "forecast_query",
    "alert_check",
    "agro_advisory",
    "historical_climate",
    "cyclone_track",
    "general_weather",
    "aviation_briefing",
    "marine_advisory",
    "climate_trend",
    "urban_monitoring",
    "clarification_needed",
]


class NLPResult(BaseModel):
    lang: str
    en_text: str
    intent: str
    confidence: float
    slots: dict[str, Any]
    original_message: str


class GISLocation(BaseModel):
    name: str
    lat: float
    lon: float
    district: str | None = None
    state: str | None = None
    country: str = "IN"
    geohash: str
    coastal_zone: str | None = None
    source: Literal["cache", "nominatim", "owm_geo"] = "nominatim"


class WeatherData(BaseModel):
    location: str
    lat: float
    lon: float
    coastal_zone: str | None = None
    date: str
    temperature_max: float
    temperature_min: float
    rainfall_mm: float
    rainfall_probability: float
    wind_speed_kmh: float
    wind_direction: str
    humidity_percent: float
    wave_height_m: float | None = None
    visibility_km: float | None = None
    condition: str
    cyclone_warning: bool = False
    cyclone_name: str | None = None
    heatwave_warning: bool = False
    nwp_model: str | None = None
    source: str
    source_url: str
    fetched_at: datetime


class GFSData(BaseModel):
    location: str
    lat: float
    lon: float
    date: str
    forecast_hour: int
    rainfall_mm_per_hr: float
    temperature_c: float
    humidity_percent: float
    wind_speed_kmh: float
    wind_direction_deg: float
    model: str = "GFS"
    run_time: str
    source_url: str
    fetched_at: datetime


class Citation(BaseModel):
    source: str
    detail: str
    url: str


class WeatherSummary(BaseModel):
    location: str
    date: str
    rainfall_mm: float | None = None
    condition: str | None = None
    nwp_model: str | None = None
    wave_height_m: float | None = None
    fishing_zone_safe: bool | None = None
    coastal_zone: str | None = None


class QueryRequest(BaseModel):
    message: str
    session_id: str
    location_hint: str | None = None
    input_mode: Literal["text", "voice"] = "text"
    detail_level: Literal["short", "medium", "long"] = "short"


class QueryResponse(BaseModel):
    answer: str
    citations: list[Citation]
    weather_summary: WeatherSummary
    alert_level: Literal["none", "advisory", "watch", "warning"] = "none"
    use_case_context: Literal[
        "farmer", "fisherman", "disaster", "researcher", "aviation", "urban", "general"
    ] = "general"
    llm_source: str = "nvidia-nim"


class AlertSubscribeRequest(BaseModel):
    user_api_key: str
    location: str
    threshold_type: Literal["rainfall", "cyclone", "heatwave", "wave_height", "marine_warning", "fishermen_alert"]
    threshold_value: float


class ClimateTrendResponse(BaseModel):
    location: str
    parameter: str
    unit: str
    granularity: str
    data: list[dict[str, Any]]
    trend: dict[str, Any]
    citations: list[Citation]


class VoiceTranscribeResponse(BaseModel):
    transcribed_text: str
    detected_lang: str
    confidence: float
    session_id: str
