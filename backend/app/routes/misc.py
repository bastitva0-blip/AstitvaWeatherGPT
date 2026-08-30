"""Thin routes needed by the frontend but not previously exposed directly:
POST /api/feedback, GET /api/aqi, GET /api/metar, GET /api/agro, POST /api/push/subscribe.
See WeatherGPT frontend prompt, section 25."""
from __future__ import annotations

import secrets
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.auth import verify_api_key
from app.models.database import HallucinationLog, PushSubscription, User, get_db
from app.services import agro_service, aqi_service, aviation_service, gis_service, weather_service

router = APIRouter()


class DevKeyRequest(BaseModel):
    email: str
    name: str | None = None


@router.post("/api/dev/key")
async def issue_dev_key(body: DevKeyRequest, db: AsyncSession = Depends(get_db)):
    """Get-or-create a per-user API key for the Developer page. Signed-in users only
    (frontend gates this behind Firebase auth) — no X-API-Key required to bootstrap."""
    existing = (await db.execute(select(User).where(User.email == body.email))).scalar_one_or_none()
    if existing is not None:
        return {"api_key": existing.apiKey}
    user = User(apiKey=f"wgpt_{secrets.token_urlsafe(24)}", email=body.email, name=body.name)
    db.add(user)
    await db.commit()
    return {"api_key": user.apiKey}


class FeedbackRequest(BaseModel):
    query_id: str
    sentiment: str  # "positive" | "negative"
    reason: str | None = None
    response_text: str


@router.post("/api/feedback")
async def submit_feedback(body: FeedbackRequest, api_key: str = Depends(verify_api_key), db: AsyncSession = Depends(get_db)):
    log = HallucinationLog(
        queryId=body.query_id,
        response=body.response_text,
        issue=body.reason if body.sentiment == "negative" else "positive_feedback",
    )
    db.add(log)
    await db.commit()
    return {"id": log.id, "status": "recorded"}


@router.get("/api/aqi")
async def aqi(location: str, api_key: str = Depends(verify_api_key)):
    gis_location = await gis_service.resolve_location(location)
    if gis_location is None:
        raise HTTPException(status_code=404, detail=f"Could not resolve location: {location}")
    data = await aqi_service.fetch_aqi(gis_location.lat, gis_location.lon)
    if data is None:
        raise HTTPException(status_code=503, detail="AQI unavailable for this location")
    return data


@router.get("/api/metar")
async def metar(icao: str, api_key: str = Depends(verify_api_key)):
    data = await aviation_service.fetch_metar(icao.upper())
    if data is None:
        raise HTTPException(status_code=404, detail=f"No METAR available for {icao}")
    return data


@router.get("/api/agro")
async def agro(location: str, crop: str, date: str | None = None, api_key: str = Depends(verify_api_key)):
    date_str = date or datetime.now(timezone.utc).date().isoformat()
    weather_data = await weather_service.fetch_weather_for_name(location, date_str)
    if weather_data is None:
        raise HTTPException(status_code=404, detail=f"Could not resolve location: {location}")
    advisory = agro_service.get_agro_advisory(crop, weather_data)
    return {
        "advisory": advisory or f"No specific advisory rules for crop '{crop}'.",
        "weather_used": weather_data,
        "citations": [
            {"source": "IMD", "detail": "District forecast", "url": "https://mausam.imd.gov.in"},
            {"source": "ICAR", "detail": "Crop threshold guidelines", "url": ""},
        ],
    }


class PushSubscriptionKeys(BaseModel):
    p256dh: str
    auth: str


class PushSubscribeRequest(BaseModel):
    endpoint: str
    keys: PushSubscriptionKeys


@router.post("/api/push/subscribe")
async def push_subscribe(body: PushSubscribeRequest, api_key: str = Depends(verify_api_key), db: AsyncSession = Depends(get_db)):
    existing = (await db.execute(select(PushSubscription).where(PushSubscription.endpoint == body.endpoint))).scalar_one_or_none()
    if existing is None:
        db.add(PushSubscription(endpoint=body.endpoint, p256dh=body.keys.p256dh, auth=body.keys.auth))
        await db.commit()
    return {"status": "subscribed"}
