import asyncio
from unittest.mock import AsyncMock, MagicMock, patch

import pytest

from app.services.wis2_service import WIS2Subscriber


@pytest.mark.asyncio
async def test_wis2_subscriber_initializes():
    redis_mock = AsyncMock()
    loop = asyncio.get_event_loop()
    sub = WIS2Subscriber(redis_client=redis_mock, loop=loop)
    assert sub.client is not None


@pytest.mark.asyncio
async def test_wis2_disabled_mode_no_connection():
    with patch("app.services.wis2_service.settings") as mock_settings:
        mock_settings.WIS2_ENABLED = False
        redis_mock = AsyncMock()
        sub = WIS2Subscriber(redis_client=redis_mock, loop=asyncio.get_event_loop())
        sub.start()  # no-op in disabled mode


@pytest.mark.asyncio
async def test_wis2_message_parsed_correctly():
    sample_notification = {
        "id": "test-uuid",
        "type": "Feature",
        "geometry": {"type": "Point", "coordinates": [77.20, 28.61]},
        "properties": {
            "data_id": "test-data-001",
            "datetime": "2026-08-28T06:00:00Z",
            "links": [
                {"href": "https://example.com/data.bufr", "rel": "canonical", "type": "application/bufr"}
            ],
        },
    }
    redis_mock = AsyncMock()
    sub = WIS2Subscriber(redis_client=redis_mock, loop=asyncio.get_event_loop())

    with patch("httpx.AsyncClient.get") as mock_get:
        mock_resp = MagicMock()
        mock_resp.status_code = 200
        mock_resp.content = b"fake_bufr_data"

        async def _get(*args, **kwargs):
            return mock_resp

        mock_get.side_effect = _get
        await sub._ingest_wis2_data(sample_notification, "https://example.com/data.bufr")
        redis_mock.setex.assert_called_once()
        key_used = redis_mock.setex.call_args[0][0]
        assert key_used.startswith("wis2:")


@pytest.mark.asyncio
async def test_wis2_broker_unreachable_falls_back_gracefully():
    with patch("app.services.wis2_service.settings") as mock_settings:
        mock_settings.WIS2_ENABLED = True
        mock_settings.WIS2_BROKER_HOST = "unreachable.invalid"
        mock_settings.WIS2_BROKER_PORT = 8883
        redis_mock = AsyncMock()
        sub = WIS2Subscriber(redis_client=redis_mock, loop=asyncio.get_event_loop())
        sub.start()  # should not raise
