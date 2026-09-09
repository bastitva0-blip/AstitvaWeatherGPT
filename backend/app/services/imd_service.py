"""IMD (India Meteorological Department) direct integration.

IMD provides weather data through multiple channels:
  - mausam.imd.gov.in JSON API (undocumented but publicly accessible)
  - city-forecast endpoint returns current + 5-day forecast
  - No API key required for public data (IMD_API_KEY used if provided for
    priority/higher-resolution endpoints)

This service:
  1. Tries IMD direct API first (India-sourced, authoritative for MoES mandate)
  2. Falls back to OpenWeatherMap if IMD unavailable or location not found
  3. Caches IMD data in Redis for 30 min (IMD updates every 3-6 hours)

Why this matters: OpenWeatherMap proxies India data from IMD anyway but with
a 6-12 hour lag. Direct IMD gives us fresher data and directly satisfies the
MoES PS requirement of using authoritative government sources.
"""
from __future__ import annotations

import json
import logging
from datetime import datetime, timezone

import httpx

from app.core.cache import get_redis
from app.core.config import settings

logger = logging.getLogger(__name__)

# IMD mausam.imd.gov.in JSON endpoints
IMD_CURRENT_URL  = "https://mausam.imd.gov.in/api/current_wx_api.php"
IMD_FORECAST_URL = "https://mausam.imd.gov.in/api/city_fct_api.php"

# IMD city_id lookup — top 50 Indian cities
# Full list: https://mausam.imd.gov.in/responsive/cityspecificenglish.php
_CITY_IDS: dict[str, int] = {
    "delhi": 1273294, "new delhi": 1273294,
    "mumbai": 1275339, "bombay": 1275339,
    "bangalore": 1277333, "bengaluru": 1277333,
    "hyderabad": 1269843,
    "chennai": 1264527, "madras": 1264527,
    "kolkata": 1275004, "calcutta": 1275004,
    "pune": 1259229,
    "ahmedabad": 1279233,
    "jaipur": 1269515,
    "lucknow": 1264733,
    "kanpur": 1267995,
    "nagpur": 1262321,
    "visakhapatnam": 1253573,
    "bhopal": 1275841,
    "patna": 1260086,
    "ludhiana": 1264728,
    "agra": 1279259,
    "vadodara": 1253626,
    "surat": 1255364,
    "nashik": 1262240,
    "meerut": 1261481,
    "rajkot": 1258718,
    "varanasi": 1253102,
    "amritsar": 1278942,
    "allahabad": 1275817, "prayagraj": 1275817,
    "ranchi": 1258290,
    "coimbatore": 1267374,
    "guwahati": 1271626,
    "chandigarh": 1274744,
    "thiruvananthapuram": 1254163,
    "bhubaneswar": 1258813,
    "kochi": 1273874,
    "indore": 1269103,
    "srinagar": 1257418,
    "goa": 1275454, "panaji": 1275454,
    "dehradun": 1273827,
    "shimla": 1256234,
    "raipur": 1258526,
    "jodhpur": 1268131,
    "madurai": 1263780,
    "vijayawada": 1253346,
    "mangalore": 1262693,
    "mysore": 1262222,
    "hubli": 1268001,
    "tirupati": 1254425,
}


def _get_city_id(location_name: str) -> int | None:
    return _CITY_IDS.get(location_name.lower().strip())


def _parse_imd_current(data: dict) -> dict | None:
    """Parse IMD current weather JSON into Sanket's WeatherData shape."""
    try:
        rec = data[0] if isinstance(data, list) else data
        temp_max = float(rec.get("max_temp") or rec.get("temp") or 0)
        temp_min = float(rec.get("min_temp") or temp_max - 5)
        return {
            "location":          rec.get("city_name", "Unknown"),
            "date":              datetime.now(timezone.utc).date().isoformat(),
            "condition":         rec.get("weather_desc", ""),
            "temperature_max":   temp_max,
            "temperature_min":   temp_min,
            "humidity_percent":  float(rec.get("humidity") or 0),
            "wind_speed_kmh":    float(rec.get("wind_speed") or 0),
            "wind_direction":    rec.get("wind_dir", ""),
            "visibility_km":     float(rec.get("visibility") or 0),
            "rainfall_mm":       float(rec.get("rainfall") or 0),
            "source":            "IMD (India Meteorological Department)",
            "source_url":        "https://mausam.imd.gov.in",
            "imd_city_id":       rec.get("city_id"),
            "imd_last_updated":  rec.get("date") or datetime.now(timezone.utc).isoformat(),
        }
    except (KeyError, ValueError, TypeError, IndexError) as e:
        logger.warning(f"IMD current parse failed: {e}")
        return None


def _parse_imd_forecast(data: dict) -> list[dict]:
    """Parse IMD 5-day forecast JSON."""
    try:
        days = data if isinstance(data, list) else data.get("data", [])
        result = []
        for day in days[:7]:
            result.append({
                "date":          day.get("fcst_date", ""),
                "condition":     day.get("weather", ""),
                "temp_max":      float(day.get("max_temp") or 0),
                "temp_min":      float(day.get("min_temp") or 0),
                "rainfall_mm":   float(day.get("rainfall") or 0),
                "wind_speed":    float(day.get("wind_speed") or 0),
                "wind_dir":      day.get("wind_dir", ""),
                "humidity":      float(day.get("humidity") or 0),
                "source":        "IMD",
            })
        return result
    except Exception as e:
        logger.warning(f"IMD forecast parse failed: {e}")
        return []


async def fetch_imd_weather(location_name: str) -> dict | None:
    """
    Fetch current weather from IMD directly.
    Returns None if location not in IMD city list or API unavailable.
    Falls back to None gracefully — caller uses OWM as fallback.
    """
    city_id = _get_city_id(location_name)
    if city_id is None:
        logger.debug(f"IMD: no city_id for '{location_name}' — not in lookup table")
        return None

    redis     = get_redis()
    cache_key = f"imd:current:{city_id}"
    cached    = await redis.get(cache_key)
    if cached:
        return json.loads(cached)

    headers = {}
    if settings.IMD_API_KEY:
        headers["Authorization"] = f"Bearer {settings.IMD_API_KEY}"

    try:
        async with httpx.AsyncClient() as client:
            resp = await client.get(
                IMD_CURRENT_URL,
                params={"city_id": city_id},
                headers=headers,
                timeout=10.0,
            )
            if resp.status_code != 200:
                logger.warning(f"IMD API returned {resp.status_code} for city_id={city_id}")
                return None
            parsed = _parse_imd_current(resp.json())
    except Exception as e:
        logger.warning(f"IMD fetch failed for {location_name}: {e}")
        return None

    if parsed:
        # 30 min cache — IMD updates every 3-6 hours
        await redis.setex(cache_key, 1800, json.dumps(parsed))

    return parsed


async def fetch_imd_forecast(location_name: str) -> list[dict]:
    """Fetch 5-day forecast from IMD for a city."""
    city_id = _get_city_id(location_name)
    if city_id is None:
        return []

    redis     = get_redis()
    cache_key = f"imd:forecast:{city_id}"
    cached    = await redis.get(cache_key)
    if cached:
        return json.loads(cached)

    headers = {}
    if settings.IMD_API_KEY:
        headers["Authorization"] = f"Bearer {settings.IMD_API_KEY}"

    try:
        async with httpx.AsyncClient() as client:
            resp = await client.get(
                IMD_FORECAST_URL,
                params={"city_id": city_id},
                headers=headers,
                timeout=10.0,
            )
            if resp.status_code != 200:
                return []
            forecasts = _parse_imd_forecast(resp.json())
    except Exception as e:
        logger.warning(f"IMD forecast fetch failed for {location_name}: {e}")
        return []

    if forecasts:
        await redis.setex(cache_key, 1800, json.dumps(forecasts))

    return forecasts


def get_supported_imd_cities() -> list[str]:
    """Return list of cities with direct IMD data available."""
    return sorted(set(_CITY_IDS.keys()))
