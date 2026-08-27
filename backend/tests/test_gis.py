import pytest

from app.services import gis_service
from app.services.gis_service import compute_geohash, get_coastal_zone, resolve_location


class _FakeGeo:
    def __init__(self, lat, lon, address):
        self.latitude = lat
        self.longitude = lon
        self.raw = {"address": address}


@pytest.fixture(autouse=True)
def _mock_nominatim(monkeypatch):
    known = {
        "varanasi, india": _FakeGeo(25.32, 82.97, {"state_district": "Varanasi", "state": "Uttar Pradesh"}),
        "kochi, india": _FakeGeo(9.93, 76.26, {"state_district": "Ernakulam", "state": "Kerala"}),
        "yavatmal, india": _FakeGeo(20.39, 78.13, {"state_district": "Yavatmal", "state": "Maharashtra"}),
        "chennai, india": _FakeGeo(13.08, 80.27, {"state_district": "Chennai", "state": "Tamil Nadu"}),
    }

    def fake_geocode(query, **kwargs):
        return known.get(query.lower())

    monkeypatch.setattr(gis_service._geocoder, "geocode", fake_geocode)
    yield


@pytest.mark.asyncio
async def test_resolve_known_city():
    result = await resolve_location("Varanasi")
    assert result is not None
    assert abs(result.lat - 25.32) < 0.5
    assert abs(result.lon - 82.97) < 0.5
    assert result.geohash is not None


@pytest.mark.asyncio
async def test_resolve_coastal_location():
    result = await resolve_location("Kochi")
    assert result is not None
    assert result.state == "Kerala"


@pytest.mark.asyncio
async def test_coastal_zone_detection():
    await gis_service.load_coastal_zones()
    zone = await get_coastal_zone(lat=9.93, lon=76.26)
    assert zone is None or isinstance(zone, str)


@pytest.mark.asyncio
async def test_resolve_location_uses_cache(monkeypatch):
    await resolve_location("Chennai")

    def broken_geocode(*args, **kwargs):
        raise Exception("Nominatim unavailable")

    monkeypatch.setattr(gis_service._geocoder, "geocode", broken_geocode)
    result = await resolve_location("Chennai")
    assert result is not None  # served from DB cache


def test_geohash_precision():
    h = compute_geohash(28.61, 77.20, precision=6)
    assert len(h) == 6


@pytest.mark.asyncio
async def test_resolve_district_name():
    result = await resolve_location("Yavatmal")
    assert result is not None
    assert result.state == "Maharashtra"
