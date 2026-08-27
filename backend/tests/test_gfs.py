import pytest

from app.services import gfs_service
from app.services.gfs_service import convert_gfs_units, fetch_gfs_forecast


@pytest.fixture(autouse=True)
def _no_retry_backoff(monkeypatch):
    # _fetch_with_retry sleeps 2s between attempts; skip the real delay in tests.
    async def instant_sleep(seconds):
        return None

    monkeypatch.setattr(gfs_service.asyncio, "sleep", instant_sleep)


@pytest.mark.asyncio
async def test_gfs_fetch_returns_valid_schema(monkeypatch):
    class _Resp:
        status_code = 200

        def json(self):
            return {
                "generationtime_ms": 0.5,
                "hourly": {
                    "time": ["2026-08-29T00:00", "2026-08-29T12:00", "2026-08-29T13:00"],
                    "precipitation": [0.0, 2.4, 1.1],
                    "temperature_2m": [24.1, 31.2, 30.5],
                    "relative_humidity_2m": [80, 55, 58],
                    "wind_speed_10m": [8.3, 14.6, 13.9],
                    "wind_direction_10m": [190, 210, 205],
                },
            }

    async def fake_get(self, url, params=None, timeout=None):
        return _Resp()

    monkeypatch.setattr("httpx.AsyncClient.get", fake_get)
    result = await fetch_gfs_forecast(lat=25.32, lon=82.97, date="2026-08-29")
    assert result is not None
    assert "rainfall_mm_per_hr" in result
    assert "temperature_c" in result
    assert result["model"] == "GFS"
    assert result["temperature_c"] == 31.2  # picked the 12:00 (midday) sample
    assert -90 <= result["temperature_c"] <= 60


@pytest.mark.asyncio
async def test_gfs_fallback_on_nomads_failure(monkeypatch):
    async def mock_get(self, url, params=None, timeout=None):
        raise Exception("NOMADS unavailable")

    monkeypatch.setattr("httpx.AsyncClient.get", mock_get)
    result = await fetch_gfs_forecast(lat=1.11, lon=2.22, date="2026-08-29")
    assert result is None


def test_gfs_unit_conversion():
    assert abs(convert_gfs_units("temp_k", 300.15) - 27.0) < 0.01
    assert abs(convert_gfs_units("prate", 0.001) - 3.6) < 0.01
    assert abs(convert_gfs_units("wind_ms", 10.0) - 36.0) < 0.01
