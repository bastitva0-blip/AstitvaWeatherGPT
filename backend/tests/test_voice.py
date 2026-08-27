import pytest
from fastapi.testclient import TestClient

from app.main import app


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


def test_voice_endpoint_rejects_oversized_file(client):
    big_audio = b"0" * (11 * 1024 * 1024)
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
