from __future__ import annotations

import asyncio
import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from prometheus_fastapi_instrumentator import Instrumentator
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address

from app.core.cache import close_redis, get_redis
from app.models.database import init_db
from app.routes import admin, alerts, climate, query, voice, weather, websocket
from app.services.gis_service import load_coastal_zones
from app.services.wis2_service import WIS2Subscriber

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

limiter = Limiter(key_func=get_remote_address, default_limits=["60/minute"])

app = FastAPI(title="WeatherGPT", version="3.0.0")
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Railway frontend/backend live on separate domains
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(query.router, tags=["query"])
app.include_router(weather.router, tags=["weather"])
app.include_router(alerts.router, tags=["alerts"])
app.include_router(admin.router, tags=["admin"])
app.include_router(voice.router, tags=["voice"])
app.include_router(climate.router, tags=["climate"])
app.include_router(websocket.router, tags=["websocket"])

Instrumentator().instrument(app).expose(app)

_wis2_subscriber: WIS2Subscriber | None = None


@app.on_event("startup")
async def startup():
    global _wis2_subscriber
    try:
        await init_db()
    except Exception as e:
        logger.warning(f"DB init skipped/failed (non-fatal for demo): {e}")

    await load_coastal_zones()

    app.state.redis = get_redis()
    _wis2_subscriber = WIS2Subscriber(redis_client=app.state.redis, loop=asyncio.get_event_loop())
    _wis2_subscriber.start()


@app.on_event("shutdown")
async def shutdown():
    if _wis2_subscriber:
        _wis2_subscriber.stop()
    await close_redis()


@app.get("/health")
async def health():
    return {"status": "ok", "service": "WeatherGPT", "version": "3.0.0"}
