import pytest

from app.models.schemas import GISLocation
from app.services.weather_service import fetch_weather


@pytest.mark.asyncio
async def test_fetch_weather_returns_full_schema():
    loc = GISLocation(name="varanasi", lat=25.32, lon=82.97, geohash="tsjgh0")
    result = await fetch_weather(loc, "2026-08-29")
    for field in ("temperature_max", "temperature_min", "rainfall_mm", "wind_speed_kmh",
                  "humidity_percent", "condition", "source", "fetched_at"):
        assert field in result


@pytest.mark.asyncio
async def test_fetch_weather_is_cached(monkeypatch):
    loc = GISLocation(name="kochi", lat=9.93, lon=76.26, geohash="tdr1y")
    first = await fetch_weather(loc, "2026-08-30")
    second = await fetch_weather(loc, "2026-08-30")
    assert first == second


@pytest.mark.asyncio
async def test_fetch_weather_deterministic_for_same_inputs():
    loc = GISLocation(name="delhi", lat=28.61, lon=77.20, geohash="ttnfv")
    r1 = await fetch_weather(loc, "2026-09-01")
    r2 = await fetch_weather(GISLocation(name="delhi2", lat=28.61, lon=77.20, geohash="ttnfv"), "2026-09-01")
    assert isinstance(r1["rainfall_mm"], float)
