"""Real METAR aviation weather via aviationweather.gov (US NOAA/FAA public
API, free, no key, covers airports worldwide including Indian ICAO codes) —
used for the aviation_briefing use case. Was previously extracted (icao_code
slot) but never actually fetched; this closes that gap with real data.
"""
from __future__ import annotations

import logging

import httpx

logger = logging.getLogger(__name__)

METAR_URL = "https://aviationweather.gov/api/data/metar"


async def fetch_metar(icao_code: str) -> dict | None:
    try:
        async with httpx.AsyncClient() as client:
            resp = await client.get(
                METAR_URL, params={"ids": icao_code.upper(), "format": "json"}, timeout=10.0
            )
            if resp.status_code != 200:
                return None
            arr = resp.json()
            if not arr:
                return None
            m = arr[0]
            return {
                "icao_code": m.get("icaoId"),
                "station_name": m.get("name"),
                "raw_metar": m.get("rawOb"),
                "temperature_c": m.get("temp"),
                "dewpoint_c": m.get("dewp"),
                "wind_direction_deg": m.get("wdir"),
                "wind_speed_kt": m.get("wspd"),
                "visibility_sm": m.get("visib"),
                "qnh_hpa": m.get("altim"),
                "flight_category": m.get("fltCat"),  # VFR/MVFR/IFR/LIFR
                "observed_at": m.get("reportTime"),
                "source": "aviationweather.gov METAR",
                "source_url": METAR_URL,
            }
    except Exception as e:
        logger.warning(f"METAR fetch failed for {icao_code}: {e}")
        return None
