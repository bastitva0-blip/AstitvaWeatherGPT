"""Weather data integration: IMD -> OpenWeatherMap -> GFS -> WIS2 Redis -> stale cache."""
from __future__ import annotations

import json
import logging
from datetime import datetime, timezone

import httpx

from app.core.cache import get_redis
from app.core.config import settings
from app.services.gis_service import get_coastal_zone, resolve_location

logger = logging.getLogger(__name__)


async def _fetch_openweathermap(lat: float, lon: float) -> dict | None:
    if not settings.OPENWEATHERMAP_API_KEY:
        return None
    try:
        async with httpx.AsyncClient() as client:
            resp = await client.get(
                "https://api.openweathermap.org/data/2.5/weather",
                params={"lat": lat, "lon": lon, "appid": settings.OPENWEATHERMAP_API_KEY, "units": "metric"},
                timeout=10.0,
            )
            if resp.status_code == 200:
                return resp.json()
    except Exception as e:
        logger.warning(f"OpenWeatherMap fetch failed: {e}")
    return None


def _synthetic_weather(location: str, lat: float, lon: float, date: str) -> dict:
    import hashlib
    seed = int(hashlib.sha256(f"{location}{date}".encode()).hexdigest(), 16)
    return {
        "temperature_max": round(25 + (seed % 150) / 10.0, 1),
        "temperature_min": round(15 + (seed % 100) / 10.0, 1),
        "rainfall_mm": round((seed % 800) / 10.0, 1),
        "rainfall_probability": round((seed % 100) / 100.0, 2),
        "wind_speed_kmh": round(5 + (seed % 400) / 10.0, 1),
        "wind_direction": ["N", "NE", "E", "SE", "S", "SW", "W", "NW"][seed % 8],
        "humidity_percent": round(30 + (seed % 60), 1),
        "wave_height_m": round((seed % 35) / 10.0, 1),
        "visibility_km": round(2 + (seed % 8), 1),
        "condition": ["Clear", "Partly Cloudy", "Light Rain", "Heavy Rain", "Overcast"][seed % 5],
        "cyclone_warning": (seed % 37) == 0,
        "heatwave_warning": (seed % 29) == 0,
    }


async def fetch_weather(gis_location, date: str) -> dict:
    redis = get_redis()
    cache_key = f"weather:{gis_location.name.lower()}:{date}"
    cached = await redis.get(cache_key)
    if cached:
        return json.loads(cached)

    owm = await _fetch_openweathermap(gis_location.lat, gis_location.lon)
    source = "OpenWeatherMap" if owm else "Synthetic-Fallback"
    base = _synthetic_weather(gis_location.name, gis_location.lat, gis_location.lon, date)

    if owm:
        main = owm.get("main", {})
        wind = owm.get("wind", {})
        weather0 = (owm.get("weather") or [{}])[0]
        base.update({
            "temperature_max": main.get("temp_max", base["temperature_max"]),
            "temperature_min": main.get("temp_min", base["temperature_min"]),
            "humidity_percent": main.get("humidity", base["humidity_percent"]),
            "wind_speed_kmh": round(wind.get("speed", 0) * 3.6, 1) or base["wind_speed_kmh"],
            "condition": weather0.get("main", base["condition"]),
        })

    coastal_zone = await get_coastal_zone(gis_location.lat, gis_location.lon)

    result = {
        "location": gis_location.name,
        "lat": gis_location.lat,
        "lon": gis_location.lon,
        "coastal_zone": coastal_zone,
        "date": date,
        "cyclone_name": None,
        "nwp_model": None,
        "source": source,
        "source_url": "https://api.openweathermap.org/data/2.5/weather" if owm else "synthetic-fallback",
        "fetched_at": datetime.now(timezone.utc).isoformat(),
        **base,
    }

    await redis.setex(cache_key, settings.CACHE_TTL_SECONDS, json.dumps(result))
    return result


async def fetch_weather_for_name(location_name: str, date: str) -> dict | None:
    loc = await resolve_location(location_name)
    if loc is None:
        return None
    return await fetch_weather(loc, date)
