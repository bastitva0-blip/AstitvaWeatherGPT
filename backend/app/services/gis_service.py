"""GIS Service — Geocoding + spatial utilities (satisfies PS "GIS tools" requirement)."""
from __future__ import annotations

import json
import logging
import os
from functools import lru_cache

import httpx
from geopy.geocoders import Nominatim
from shapely.geometry import Point, shape
from sqlalchemy import select

from app.core.config import settings
from app.models.database import LocationCache, get_session_factory
from app.models.schemas import GISLocation

logger = logging.getLogger(__name__)

_geocoder = Nominatim(user_agent=settings.NOMINATIM_USER_AGENT)

COASTAL_ZONES_PATH = os.path.join(os.path.dirname(__file__), "..", "..", "data", "indian_coastal_zones.geojson")
_coastal_zones: list[tuple[str, object]] = []


def compute_geohash(lat: float, lon: float, precision: int = 6) -> str:
    _base32 = "0123456789bcdefghjkmnpqrstuvwxyz"
    lat_range, lon_range = [-90.0, 90.0], [-180.0, 180.0]
    geohash, bit, ch, even = [], 0, 0, True
    while len(geohash) < precision:
        if even:
            mid = (lon_range[0] + lon_range[1]) / 2
            if lon > mid:
                ch |= 1 << (4 - bit)
                lon_range[0] = mid
            else:
                lon_range[1] = mid
        else:
            mid = (lat_range[0] + lat_range[1]) / 2
            if lat > mid:
                ch |= 1 << (4 - bit)
                lat_range[0] = mid
            else:
                lat_range[1] = mid
        even = not even
        if bit < 4:
            bit += 1
        else:
            geohash.append(_base32[ch])
            bit, ch = 0, 0
    return "".join(geohash)


async def load_coastal_zones(path: str = COASTAL_ZONES_PATH) -> None:
    global _coastal_zones
    if not os.path.exists(path):
        logger.warning(f"Coastal zones GeoJSON not found at {path} — coastal lookup disabled")
        _coastal_zones = []
        return
    with open(path, encoding="utf-8") as f:
        data = json.load(f)
    _coastal_zones = [
        (feat["properties"].get("name", "unknown_zone"), shape(feat["geometry"]))
        for feat in data.get("features", [])
    ]
    logger.info(f"Loaded {len(_coastal_zones)} coastal zones")


async def get_coastal_zone(lat: float, lon: float) -> str | None:
    point = Point(lon, lat)
    for name, polygon in _coastal_zones:
        if polygon.contains(point):
            return name
    return None


def _normalize(name: str) -> str:
    return name.strip().lower()


async def resolve_location(name: str) -> GISLocation | None:
    if not name:
        return None
    normalized = _normalize(name)
    factory = get_session_factory()
    async with factory() as db:
        result = await db.execute(select(LocationCache).where(LocationCache.name == normalized))
        cached = result.scalar_one_or_none()
        if cached:
            zone = await get_coastal_zone(cached.lat, cached.lon)
            return GISLocation(
                name=cached.name, lat=cached.lat, lon=cached.lon,
                district=cached.district, state=cached.state, country=cached.country,
                geohash=cached.geohash or compute_geohash(cached.lat, cached.lon),
                coastal_zone=zone, source="cache",
            )

        lat = lon = None
        district = state = None
        country = "IN"
        source = "nominatim"
        # Try India-biased first (this app's primary audience), then fall
        # back to an unrestricted global lookup — WeatherGPT should resolve
        # any place on Earth, not just Indian towns, even though IMD/GFS
        # grounding is India-focused.
        for query, timeout in ((f"{name}, India", 8), (name, 8)):
            try:
                geo = _geocoder.geocode(query, language="en", addressdetails=True, timeout=timeout)
                if geo:
                    lat, lon = geo.latitude, geo.longitude
                    addr = geo.raw.get("address", {})
                    district = addr.get("state_district") or addr.get("county")
                    state = addr.get("state")
                    country = (addr.get("country_code") or "in").upper()
                    break
            except Exception as e:
                logger.warning(f"Nominatim geocode failed for '{query}': {e}")

        if lat is None and settings.OPENWEATHERMAP_API_KEY:
            try:
                async with httpx.AsyncClient() as client:
                    resp = await client.get(
                        "https://api.openweathermap.org/geo/1.0/direct",
                        params={"q": name, "limit": 1, "appid": settings.OPENWEATHERMAP_API_KEY},
                        timeout=10.0,
                    )
                    arr = resp.json()
                    if arr:
                        lat, lon = arr[0]["lat"], arr[0]["lon"]
                        state = arr[0].get("state")
                        country = arr[0].get("country", "IN")
                        source = "owm_geo"
            except Exception as e:
                logger.warning(f"OWM geo fallback failed for {name}: {e}")

        if lat is None:
            return None

        geohash = compute_geohash(lat, lon)
        row = LocationCache(
            name=normalized, lat=lat, lon=lon, district=district, state=state,
            country=country, geohash=geohash,
        )
        db.add(row)
        await db.commit()

        zone = await get_coastal_zone(lat, lon)
        return GISLocation(
            name=normalized, lat=lat, lon=lon, district=district, state=state,
            country=country, geohash=geohash, coastal_zone=zone, source=source,
        )


async def get_district_for_coords(lat: float, lon: float) -> dict:
    try:
        geo = _geocoder.reverse(f"{lat}, {lon}", language="en", timeout=10)
        if geo:
            addr = geo.raw.get("address", {})
            return {
                "district": addr.get("state_district") or addr.get("county"),
                "state": addr.get("state"),
                "country": addr.get("country_code", "in").upper(),
            }
    except Exception as e:
        logger.warning(f"Reverse geocode failed for ({lat},{lon}): {e}")
    return {"district": None, "state": None, "country": "IN"}


async def find_nearby_locations(lat: float, lon: float, radius_km: float) -> list[str]:
    prefix = compute_geohash(lat, lon, precision=4)
    factory = get_session_factory()
    async with factory() as db:
        result = await db.execute(select(LocationCache).where(LocationCache.geohash.like(f"{prefix}%")))
        return [row.name for row in result.scalars().all()]
