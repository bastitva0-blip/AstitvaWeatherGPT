from __future__ import annotations

import asyncio
import logging

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from prometheus_fastapi_instrumentator import Instrumentator
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address

from app.core.cache import close_redis, get_redis
from app.models.database import init_db
from app.routes import admin, alerts, climate, misc, query, voice, weather, websocket, sms, extras
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger
from apscheduler.triggers.interval import IntervalTrigger
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
app.include_router(misc.router, tags=["misc"])
app.include_router(sms.router, tags=["sms"])       # SMS + WhatsApp Twilio webhooks
app.include_router(extras.router, tags=["extras"]) # TTS, crop calendar, 7-day forecast

Instrumentator().instrument(app).expose(app)


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    # An unhandled exception can reach the client before CORSMiddleware gets
    # a chance to attach headers, so the browser reports a bare "Failed to
    # fetch" with no error detail. Return valid JSON with CORS headers set
    # explicitly so the frontend always gets a diagnosable error.
    logger.exception(f"Unhandled exception on {request.url.path}: {exc}")
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"},
        headers={"Access-Control-Allow-Origin": "*"},
    )

_wis2_subscriber: WIS2Subscriber | None = None


_scheduler: AsyncIOScheduler | None = None


@app.on_event("startup")
async def startup():
    global _wis2_subscriber, _scheduler
    try:
        await init_db()
    except Exception as e:
        logger.warning(f"DB init skipped/failed (non-fatal for demo): {e}")

    await load_coastal_zones()

    app.state.redis = get_redis()
    _wis2_subscriber = WIS2Subscriber(redis_client=app.state.redis, loop=asyncio.get_event_loop())
    _wis2_subscriber.start()

    # ── APScheduler cron jobs ──
    _scheduler = AsyncIOScheduler(timezone="Asia/Kolkata")

    # Push alert check every 15 minutes
    from app.services.push_notify_service import run_push_alert_cron
    _scheduler.add_job(
        run_push_alert_cron,
        IntervalTrigger(minutes=15),
        id="push_alert_cron",
        replace_existing=True,
        max_instances=1,
    )

    # Weekly feedback digest — every Monday at 09:00 IST
    from app.services.feedback_digest_service import run_feedback_digest
    _scheduler.add_job(
        run_feedback_digest,
        CronTrigger(day_of_week="mon", hour=9, minute=0),
        id="feedback_digest",
        replace_existing=True,
        max_instances=1,
    )

    _scheduler.start()
    logger.info("APScheduler started: push_alert_cron (15min) + feedback_digest (Monday 09:00 IST)")


@app.on_event("shutdown")
async def shutdown():
    if _scheduler and _scheduler.running:
        _scheduler.shutdown(wait=False)
    if _wis2_subscriber:
        _wis2_subscriber.stop()
    await close_redis()


@app.get("/health")
async def health():
    return {"status": "ok", "service": "WeatherGPT", "version": "3.0.0"}
