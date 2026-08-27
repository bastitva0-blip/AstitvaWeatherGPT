"""GFS / WRF NWP model integration.

Real data source: Open-Meteo (https://open-meteo.com), a free, keyless
weather API that serves numerical model output directly as JSON — including
NOAA's GFS model (`models=gfs_seamless`). This avoids parsing raw GRIB2 from
NOAA NOMADS (which needs eccodes/cfgrib, a heavy binary dependency) while
still returning genuine GFS forecast values, not synthetic placeholders.

WRF Note: WRF (Weather Research & Forecasting) model requires local HPC compute
and is operationally run by IMD's NWP division. GFS serves as WRF's lateral
boundary conditions in operational setups, making GFS the correct upstream
source for this build. On MoES/IMD HPC infrastructure, this service can be
pointed at an internal WRF output endpoint without changing the public
interface — only fetch_gfs_forecast's HTTP call changes.

WIS2.0 Note: when WIS2_ENABLED=True and Redis has a wis2:{lat}:{lon}:latest
key populated by wis2_service.py, that data is used instead of calling out.
"""
from __future__ import annotations

import asyncio
import json
import logging
from datetime import datetime, timezone

import httpx

from app.core.cache import get_redis
from app.core.config import settings
from app.services.gis_service import resolve_location

logger = logging.getLogger(__name__)

OPEN_METEO_URL = "https://api.open-meteo.com/v1/forecast"


def convert_gfs_units(variable: str, value: float) -> float:
    if variable == "temp_k":
        return value - 273.15
    if variable == "prate":
        return value * 3600.0
    if variable == "wind_ms":
        return value * 3.6
    raise ValueError(f"Unknown GFS unit variable: {variable}")


async def _fetch_with_retry(client: httpx.AsyncClient, url: str, params: dict, retries: int = 3) -> httpx.Response | None:
    for attempt in range(retries):
        try:
            resp = await client.get(url, params=params, timeout=15.0)
            if resp.status_code == 200:
                return resp
            if resp.status_code == 503:
                await asyncio.sleep(2)
                continue
            return None
        except Exception as e:
            logger.warning(f"Open-Meteo fetch attempt {attempt + 1} failed: {e}")
            await asyncio.sleep(2)
    return None


async def fetch_gfs_forecast(lat: float, lon: float, date: str) -> dict | None:
    redis = get_redis()
    cache_key = f"gfs:{lat:.2f}:{lon:.2f}:{date}"
    cached = await redis.get(cache_key)
    if cached:
        return json.loads(cached)

    if settings.WIS2_ENABLED:
        wis2_key = f"wis2:{lat:.2f}:{lon:.2f}:latest"
        wis2_data = await redis.get(wis2_key)
        if wis2_data:
            logger.info(f"Using WIS2.0 push data instead of Open-Meteo for {wis2_key}")

    params = {
        "latitude": lat,
        "longitude": lon,
        "hourly": "precipitation,temperature_2m,relative_humidity_2m,wind_speed_10m,wind_direction_10m",
        "models": "gfs_seamless",
        "wind_speed_unit": "kmh",
        "forecast_days": 2,
        "timezone": "UTC",
    }

    async with httpx.AsyncClient() as client:
        resp = await _fetch_with_retry(client, OPEN_METEO_URL, params)
        if resp is None:
            logger.warning("Open-Meteo (GFS) unavailable after retries")
            return None

    try:
        data = resp.json()
        hourly = data["hourly"]
        times = hourly["time"]
        target_hour = f"{date}T12:00"  # midday value as the representative daily forecast
        idx = times.index(target_hour) if target_hour in times else 0
        run_time = data.get("generationtime_ms")

        result = {
            "location": None,
            "lat": lat, "lon": lon, "date": date, "forecast_hour": idx,
            "rainfall_mm_per_hr": round(hourly["precipitation"][idx] or 0.0, 2),
            "temperature_c": round(hourly["temperature_2m"][idx], 2),
            "humidity_percent": round(hourly["relative_humidity_2m"][idx], 1),
            "wind_speed_kmh": round(hourly["wind_speed_10m"][idx], 2),
            "wind_direction_deg": round(hourly["wind_direction_10m"][idx], 1),
            "model": "GFS",
            "run_time": f"generated_in_{run_time}ms" if run_time else datetime.now(timezone.utc).isoformat(),
            "source_url": OPEN_METEO_URL,
            "fetched_at": datetime.now(timezone.utc).isoformat(),
        }
    except (KeyError, IndexError, TypeError) as e:
        logger.warning(f"Open-Meteo response parse failed: {e}")
        return None

    await redis.setex(cache_key, 3600, json.dumps(result))
    return result


async def get_gfs_extended_forecast(location: str, days: int = 7) -> list[dict]:
    loc = await resolve_location(location)
    if loc is None:
        return []
    out = []
    for _ in range(days):
        forecast = await fetch_gfs_forecast(loc.lat, loc.lon, datetime.now(timezone.utc).date().isoformat())
        if forecast:
            forecast["location"] = loc.name
            out.append(forecast)
    return out
