import pytest

from app.services import disaster_service


def _feature(event_type, alert_level, lat, lon, name="TEST-1"):
    return {
        "geometry": {"coordinates": [lon, lat]},
        "properties": {
            "eventtype": event_type, "eventname": name, "alertlevel": alert_level,
            "iscurrent": "true", "url": {"report": "https://gdacs.org/report"},
        },
    }


@pytest.mark.asyncio
async def test_detects_nearby_cyclone(monkeypatch):
    class _Resp:
        status_code = 200

        def json(self):
            return {"features": [_feature("TC", "Red", 19.0, 72.8, "CYCLONE-X")]}

    async def fake_get(self, url, params=None, timeout=None):
        return _Resp()

    monkeypatch.setattr("httpx.AsyncClient.get", fake_get)
    result = await disaster_service.get_nearby_disasters(19.07, 72.87)
    assert result["cyclone_warning"] is True
    assert result["cyclone_name"] == "CYCLONE-X"


@pytest.mark.asyncio
async def test_ignores_far_away_cyclone(monkeypatch):
    class _Resp:
        status_code = 200

        def json(self):
            return {"features": [_feature("TC", "Red", -30.0, 150.0, "FAR-CYCLONE")]}

    async def fake_get(self, url, params=None, timeout=None):
        return _Resp()

    monkeypatch.setattr("httpx.AsyncClient.get", fake_get)
    result = await disaster_service.get_nearby_disasters(19.07, 72.87)
    assert result["cyclone_warning"] is False


@pytest.mark.asyncio
async def test_green_alert_does_not_trigger_warning(monkeypatch):
    class _Resp:
        status_code = 200

        def json(self):
            return {"features": [_feature("TC", "Green", 19.0, 72.8)]}

    async def fake_get(self, url, params=None, timeout=None):
        return _Resp()

    monkeypatch.setattr("httpx.AsyncClient.get", fake_get)
    result = await disaster_service.get_nearby_disasters(19.07, 72.87)
    assert result["cyclone_warning"] is False
    assert len(result["alerts"]) == 1  # still surfaced as an informational alert


@pytest.mark.asyncio
async def test_gdacs_unreachable_degrades_gracefully(monkeypatch):
    async def fake_get(self, url, params=None, timeout=None):
        raise Exception("network down")

    monkeypatch.setattr("httpx.AsyncClient.get", fake_get)
    result = await disaster_service.get_nearby_disasters(19.07, 72.87)
    assert result["cyclone_warning"] is False
    assert result["alerts"] == []


def test_haversine_known_distance():
    # Delhi to Mumbai is ~1150km
    d = disaster_service._haversine_km(28.6139, 77.2090, 19.0760, 72.8777)
    assert 1100 < d < 1250
