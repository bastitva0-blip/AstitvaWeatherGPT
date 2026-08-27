import pytest
from fastapi.testclient import TestClient

from app.main import app


@pytest.fixture
def client():
    with TestClient(app) as c:
        yield c


def test_health(client):
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"


def test_query_endpoint_valid(client):
    response = client.post(
        "/api/query",
        json={"message": "Will it rain in Chennai tomorrow?", "session_id": "test-session-1"},
        headers={"X-API-Key": "test-key"},
    )
    assert response.status_code == 200
    body = response.json()
    assert len(body["citations"]) >= 1
    assert "answer" in body


def test_query_endpoint_missing_api_key(client):
    response = client.post(
        "/api/query",
        json={"message": "Will it rain?", "session_id": "test-session-2"},
    )
    assert response.status_code == 403


def test_alert_subscribe(client):
    response = client.post(
        "/api/alert/subscribe",
        json={"user_api_key": "test-key", "location": "Chennai",
              "threshold_type": "rainfall", "threshold_value": 50},
        headers={"X-API-Key": "test-key"},
    )
    assert response.status_code == 200
    assert response.json()["status"] == "subscribed"


def test_weather_live(client):
    response = client.get(
        "/api/weather/live", params={"location": "Varanasi"},
        headers={"X-API-Key": "test-key"},
    )
    assert response.status_code == 200
    assert "temperature_max" in response.json()


def test_admin_ingest_text(client):
    response = client.post(
        "/api/admin/ingest",
        files={"file": ("bulletin.txt", b"IMD seasonal outlook: monsoon normal this year.", "text/plain")},
        data={"domain": "climate"},
        headers={"X-API-Key": "test-key"},
    )
    assert response.status_code == 200


def test_climate_trend_endpoint_no_data_still_200(client):
    response = client.get(
        "/api/climate/trend",
        params={"location": "Vidarbha", "parameter": "rainfall", "start_year": 2010, "end_year": 2020},
        headers={"X-API-Key": "test-key"},
    )
    assert response.status_code == 200
    data = response.json()
    assert "trend" in data
    assert "citations" in data


def test_no_hallucination_in_response(client):
    response = client.post(
        "/api/query",
        json={"message": "rain in Chennai tomorrow", "session_id": "test-session-3"},
        headers={"X-API-Key": "test-key"},
    )
    assert len(response.json()["citations"]) >= 1


def test_gis_location_resolved_in_query(client, monkeypatch):
    from app.services import gis_service

    class _FakeGeo:
        latitude, longitude = 20.39, 78.13
        raw = {"address": {"state_district": "Yavatmal", "state": "Maharashtra"}}

    monkeypatch.setattr(gis_service._geocoder, "geocode", lambda *a, **k: _FakeGeo())

    response = client.post(
        "/api/query",
        json={"message": "Will it rain in Yavatmal tomorrow?", "session_id": "test-session-4"},
        headers={"X-API-Key": "test-key"},
    )
    body = response.json()
    assert body["weather_summary"]["location"] is not None


def test_fisherman_query_returns_safety_badge(client, monkeypatch):
    from app.services import gis_service

    class _FakeGeo:
        latitude, longitude = 9.93, 76.26
        raw = {"address": {"state_district": "Ernakulam", "state": "Kerala"}}

    monkeypatch.setattr(gis_service._geocoder, "geocode", lambda *a, **k: _FakeGeo())

    response = client.post(
        "/api/query",
        json={"message": "Is it safe to go fishing near Kochi tomorrow?", "session_id": "test-session-5"},
        headers={"X-API-Key": "test-key"},
    )
    body = response.json()
    assert body["use_case_context"] == "fisherman"
    assert "fishing_zone_safe" in body["weather_summary"]


def test_wis2_redis_channel_receives_alert(client):
    from app.core import cache as cache_module

    resp = client.post(
        "/api/admin/test-alert",
        params={"session_id": "wis2-test-session", "alert_type": "heavy_rain"},
        headers={"X-API-Key": "test-key"},
    )
    assert resp.status_code == 200
    fake_redis = cache_module.get_redis()
    assert "weather:alerts:wis2-test-session" in fake_redis._channels


def test_voice_to_query_flow(client):
    voice_resp = client.post(
        "/api/nlp/voice",
        files={"audio": ("test.webm", b"fakeaudio", "audio/webm")},
        headers={"X-API-Key": "test-key"},
    )
    transcript = voice_resp.json()["transcribed_text"]
    query_resp = client.post(
        "/api/query",
        json={"message": transcript, "session_id": "voice-session-1", "input_mode": "voice"},
        headers={"X-API-Key": "test-key"},
    )
    assert query_resp.status_code == 200
