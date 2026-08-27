import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.services import voice_service


@pytest.fixture(autouse=True)
def _force_stub_transcriber(monkeypatch):
    # Force the deterministic stub path regardless of whether faster-whisper
    # is installed locally — real transcription needs a model download and
    # actual audio bytes, neither of which belong in a fast/offline test.
    monkeypatch.setattr(voice_service, "load_whisper_model", lambda: "stub")


@pytest.fixture
def client():
    with TestClient(app) as c:
        yield c


@pytest.fixture
def sample_webm_audio():
    return b"\x1aE\xdf\xa3fake_webm_bytes_for_testing"


def test_voice_endpoint_webm(client, sample_webm_audio):
    response = client.post(
        "/api/nlp/voice",
        files={"audio": ("test.webm", sample_webm_audio, "audio/webm")},
        data={"hint_lang": "hi"},
        headers={"X-API-Key": "test-key"},
    )
    assert response.status_code == 200
    data = response.json()
    assert "transcribed_text" in data
    assert len(data["transcribed_text"]) > 0


def test_voice_endpoint_rejects_oversized_file(client, monkeypatch):
    # Lower the limit instead of transferring a real 10MB+ payload — the
    # 413 branch only depends on len(body) > MAX_AUDIO_BYTES, not on the
    # actual limit value, and a real 10MB multipart upload through
    # Starlette's spooled-tempfile parser adds tens of seconds to the suite
    # for no extra coverage.
    from app.routes import voice as voice_route
    monkeypatch.setattr(voice_route.voice_service, "MAX_AUDIO_BYTES", 1024)

    big_audio = b"0" * 2048
    response = client.post(
        "/api/nlp/voice",
        files={"audio": ("big.webm", big_audio, "audio/webm")},
        headers={"X-API-Key": "test-key"},
    )
    assert response.status_code == 413


def test_voice_endpoint_rejects_unsupported_format(client):
    response = client.post(
        "/api/nlp/voice",
        files={"audio": ("test.pdf", b"fake", "application/pdf")},
        headers={"X-API-Key": "test-key"},
    )
    assert response.status_code == 415
