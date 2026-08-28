"""Real cyclone/flood alerts via GDACS (Global Disaster Alert and
Coordination System — UN OCHA/EC joint initiative), free, no key, worldwide
coverage, updated continuously from NOAA/JTWC/national sources. Closes the
gap where cyclone_warning was either randomly fabricated or hardcoded False
with no real data source.
"""
from __future__ import annotations

import logging
import math

import httpx

logger = logging.getLogger(__name__)

GDACS_URL = "https://www.gdacs.org/gdacsapi/api/events/geteventlist/EVENTS4APP"
NEARBY_RADIUS_KM = 500  # cyclone impact/warning radius is large — a storm 500km out is still relevant


def _haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    r = 6371.0
    p1, p2 = math.radians(lat1), math.radians(lat2)
    dp = math.radians(lat2 - lat1)
    dl = math.radians(lon2 - lon1)
    a = math.sin(dp / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(dl / 2) ** 2
    return 2 * r * math.asin(math.sqrt(a))


async def get_nearby_disasters(lat: float, lon: float, radius_km: float = NEARBY_RADIUS_KM) -> dict:
    """Returns {cyclone_warning, cyclone_name, flood_warning, flood_name, alerts: [...]}."""
    result = {"cyclone_warning": False, "cyclone_name": None, "flood_warning": False, "flood_name": None, "alerts": []}
    try:
        async with httpx.AsyncClient() as client:
            resp = await client.get(GDACS_URL, params={"eventlist": "TC;FL"}, timeout=10.0)
            if resp.status_code != 200:
                return result
            features = resp.json().get("features", [])
    except Exception as e:
        logger.warning(f"GDACS fetch failed: {e}")
        return result

    for feature in features:
        try:
            props = feature["properties"]
            if props.get("iscurrent") != "true":
                continue
            coords = feature["geometry"]["coordinates"]
            event_lon, event_lat = coords[0], coords[1]
            distance = _haversine_km(lat, lon, event_lat, event_lon)
            if distance > radius_km:
                continue

            alert_level = props.get("alertlevel", "Green")
            event_type = props.get("eventtype")
            name = props.get("eventname") or props.get("name")

            result["alerts"].append({
                "type": event_type, "name": name, "alert_level": alert_level,
                "distance_km": round(distance, 0), "report_url": props.get("url", {}).get("report"),
            })
            if event_type == "TC" and alert_level in ("Orange", "Red"):
                result["cyclone_warning"] = True
                result["cyclone_name"] = name
            if event_type == "FL" and alert_level in ("Orange", "Red"):
                result["flood_warning"] = True
                result["flood_name"] = name
        except (KeyError, IndexError, TypeError):
            continue

    return result
