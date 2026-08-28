"""Air quality via OpenWeatherMap's free Air Pollution API — used for the
urban_monitoring/smart-city use case. Real data, same API key already in use
elsewhere in the app.
"""
from __future__ import annotations

import logging

import httpx

from app.core.config import settings

logger = logging.getLogger(__name__)

# OWM's 1-5 AQI index bands (their scale, not the US EPA 0-500 scale)
_AQI_LABELS = {1: "Good", 2: "Fair", 3: "Moderate", 4: "Poor", 5: "Very Poor"}


async def fetch_aqi(lat: float, lon: float) -> dict | None:
    if not settings.OPENWEATHERMAP_API_KEY:
        return None
    try:
        async with httpx.AsyncClient() as client:
            resp = await client.get(
                "https://api.openweathermap.org/data/2.5/air_pollution",
                params={"lat": lat, "lon": lon, "appid": settings.OPENWEATHERMAP_API_KEY},
                timeout=10.0,
            )
            if resp.status_code != 200:
                return None
            entry = (resp.json().get("list") or [None])[0]
            if not entry:
                return None
            aqi_index = entry["main"]["aqi"]
            components = entry["components"]
            return {
                "aqi_index": aqi_index,
                "aqi_label": _AQI_LABELS.get(aqi_index, "Unknown"),
                "pm2_5": components.get("pm2_5"),
                "pm10": components.get("pm10"),
                "co": components.get("co"),
                "no2": components.get("no2"),
                "o3": components.get("o3"),
                "source": "OpenWeatherMap Air Pollution API",
                "source_url": "https://api.openweathermap.org/data/2.5/air_pollution",
            }
    except Exception as e:
        logger.warning(f"AQI fetch failed: {e}")
        return None
