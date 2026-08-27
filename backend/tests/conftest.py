import asyncio
import os

os.environ.setdefault("DATABASE_URL", "sqlite+aiosqlite:///:memory:")
os.environ.setdefault("API_KEYS", "test-key")
os.environ.setdefault("ANTHROPIC_API_KEY", "")
os.environ.setdefault("OPENWEATHERMAP_API_KEY", "")

import pytest
import pytest_asyncio

from app.core import cache as cache_module
from app.models.database import init_db


class _FakeRedis:
    """Minimal in-memory async redis stand-in so tests don't need a live server."""

    def __init__(self):
        self._store: dict[str, bytes] = {}
        self._channels: dict[str, list] = {}

    async def get(self, key):
        return self._store.get(key)

    async def set(self, key, value):
        self._store[key] = value

    async def setex(self, key, ttl, value):
        self._store[key] = value if isinstance(value, (bytes, str)) else value

    async def publish(self, channel, message):
        self._channels.setdefault(channel, []).append(message)
        return 1

    async def close(self):
        pass

    def pubsub(self):
        return _FakePubSub(self)


class _FakePubSub:
    def __init__(self, redis):
        self.redis = redis

    async def subscribe(self, channel):
        pass

    async def unsubscribe(self, channel):
        pass

    async def close(self):
        pass

    async def listen(self):
        return
        yield


@pytest.fixture(autouse=True)
def _fake_redis(monkeypatch):
    fake = _FakeRedis()
    monkeypatch.setattr(cache_module, "_redis_client", fake)
    monkeypatch.setattr(cache_module, "get_redis", lambda: fake)

    for modname in (
        "app.services.weather_service",
        "app.services.gfs_service",
        "app.services.alert_service",
        "app.routes.websocket",
    ):
        import importlib
        mod = importlib.import_module(modname)
        if hasattr(mod, "get_redis"):
            monkeypatch.setattr(mod, "get_redis", lambda: fake)

    yield fake


@pytest_asyncio.fixture(autouse=True)
async def _init_test_db():
    await init_db()
    yield
