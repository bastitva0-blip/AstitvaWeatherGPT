import pytest

from app.services import agro_service, aqi_service, aviation_service


@pytest.mark.asyncio
async def test_fetch_aqi_parses_real_shape(monkeypatch):
    monkeypatch.setattr("app.services.aqi_service.settings.OPENWEATHERMAP_API_KEY", "test-owm-key")

    class _Resp:
        status_code = 200

        def json(self):
            return {"list": [{"main": {"aqi": 2}, "components": {"pm2_5": 18.9, "pm10": 48.3}}]}

    async def fake_get(self, url, params=None, timeout=None):
        return _Resp()

    monkeypatch.setattr("httpx.AsyncClient.get", fake_get)
    result = await aqi_service.fetch_aqi(28.6, 77.2)
    assert result["aqi_label"] == "Fair"
    assert result["pm2_5"] == 18.9


@pytest.mark.asyncio
async def test_fetch_aqi_no_key_returns_none(monkeypatch):
    monkeypatch.setattr("app.services.aqi_service.settings.OPENWEATHERMAP_API_KEY", "")
    assert await aqi_service.fetch_aqi(28.6, 77.2) is None


@pytest.mark.asyncio
async def test_fetch_metar_parses_real_shape(monkeypatch):
    class _Resp:
        status_code = 200

        def json(self):
            return [{
                "icaoId": "VIDP", "name": "New Delhi/Gandhi Intl", "rawOb": "METAR VIDP ...",
                "temp": 32, "wdir": 220, "wspd": 4, "visib": 2.8, "altim": 1003,
                "fltCat": "IFR", "reportTime": "2026-08-28T17:30:00.000Z",
            }]

    async def fake_get(self, url, params=None, timeout=None):
        return _Resp()

    monkeypatch.setattr("httpx.AsyncClient.get", fake_get)
    result = await aviation_service.fetch_metar("VIDP")
    assert result["flight_category"] == "IFR"
    assert result["icao_code"] == "VIDP"


@pytest.mark.asyncio
async def test_fetch_metar_handles_empty_response(monkeypatch):
    class _Resp:
        status_code = 200

        def json(self):
            return []

    async def fake_get(self, url, params=None, timeout=None):
        return _Resp()

    monkeypatch.setattr("httpx.AsyncClient.get", fake_get)
    assert await aviation_service.fetch_metar("ZZZZ") is None


def test_agro_advisory_flags_heat_stress():
    weather = {"temperature_max": 40, "temperature_min": 28, "rainfall_mm": 20}
    advisory = agro_service.get_agro_advisory("wheat", weather)
    assert "heat stress" in advisory


def test_agro_advisory_favorable_conditions():
    weather = {"temperature_max": 28, "temperature_min": 20, "rainfall_mm": 10}
    advisory = agro_service.get_agro_advisory("wheat", weather)
    assert "favorable" in advisory


def test_agro_advisory_unknown_crop_returns_none():
    assert agro_service.get_agro_advisory("mango", {}) is None


def test_agro_advisory_no_crop_returns_none():
    assert agro_service.get_agro_advisory(None, {}) is None
