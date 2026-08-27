"""Alert engine — Redis pub/sub, WIS2.0-compatible channel naming.

Channel naming mirrors WIS2.0 topic structure:
  MQTT: origin/a/wis2/ind-imd/data/recommended/weather/{location}/warnings/{type}
  Redis: weather:alerts:{session_id}
"""
from __future__ import annotations

import json
from datetime import datetime, timezone

from app.core.cache import get_redis

FISHERMEN_WAVE_THRESHOLD_M = 2.5
FISHERMEN_WIND_THRESHOLD_KMH = 45


def alert_channel(session_id: str) -> str:
    return f"weather:alerts:{session_id}"


async def publish_alert(session_id: str, alert_type: str, location: str, message: str,
                         severity: str = "advisory", source: str = "IMD",
                         fishing_zone_safe: bool | None = None) -> None:
    redis = get_redis()
    payload = {
        "type": "weather_alert",
        "location": location,
        "alert_type": alert_type,
        "message": message,
        "severity": severity,
        "source": source,
        "fishing_zone_safe": fishing_zone_safe,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }
    await redis.publish(alert_channel(session_id), json.dumps(payload))


def evaluate_thresholds(weather_data: dict, threshold_type: str, threshold_value: float) -> bool:
    if threshold_type == "rainfall":
        return weather_data.get("rainfall_mm", 0) > threshold_value
    if threshold_type == "cyclone":
        return bool(weather_data.get("cyclone_warning"))
    if threshold_type == "heatwave":
        return weather_data.get("temperature_max", 0) > threshold_value
    if threshold_type == "wave_height":
        return (weather_data.get("wave_height_m") or 0) > threshold_value
    if threshold_type in ("marine_warning", "fishermen_alert"):
        wave = weather_data.get("wave_height_m") or 0
        wind = weather_data.get("wind_speed_kmh") or 0
        return wave > FISHERMEN_WAVE_THRESHOLD_M and wind > FISHERMEN_WIND_THRESHOLD_KMH
    return False
