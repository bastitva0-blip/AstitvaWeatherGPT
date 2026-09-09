"""Twilio webhook endpoints for inbound SMS and WhatsApp.

Twilio sends a POST to these URLs when a message arrives.
Configure in Twilio Console → Phone Numbers → Messaging Webhook:
  SMS:       POST https://your-backend.railway.app/api/sms/inbound
  WhatsApp:  POST https://your-backend.railway.app/api/whatsapp/inbound
"""
from __future__ import annotations

import logging
from datetime import datetime, timezone

from fastapi import APIRouter, Form, Response

from app.services import nlp_service, gfs_service, gis_service, llm_service, weather_service
from app.services.sms_service import trim_for_sms

logger = logging.getLogger(__name__)
router = APIRouter()


async def _handle_inbound(body: str, from_number: str, channel: str) -> str:
    """Core handler — runs NLP pipeline on inbound text, returns short answer."""
    try:
        nlp   = await nlp_service.nlp_pipeline(body)
        lang  = nlp.get("lang", "en")
        slots = nlp.get("slots", {})
        location_name = slots.get("location") or "Delhi"

        gis_loc = await gis_service.resolve_location(location_name)
        if gis_loc is None:
            from app.models.schemas import GISLocation
            gis_loc = GISLocation(name=location_name, lat=28.61, lon=77.20, geohash="tttt", source="fallback")

        date_str = datetime.now(timezone.utc).date().isoformat()
        weather, gfs = await __import__('asyncio').gather(
            weather_service.fetch_weather(gis_loc, date_str),
            gfs_service.fetch_gfs_forecast(gis_loc.lat, gis_loc.lon, date_str),
        )

        answer, citations, _ = await llm_service.generate_answer(
            user_query=body,
            lang=lang,
            intent=nlp.get("intent", "general_weather"),
            slots=slots,
            weather_data=weather,
            gfs_data=gfs,
            detail_level="short",          # ← always short for SMS
            use_case_context="general",
        )
        return trim_for_sms(answer, citations, max_chars=280)

    except Exception as e:
        logger.error(f"SMS pipeline error [{channel}] from {from_number}: {e}")
        return "Sorry, we couldn't fetch weather right now. Try again in a moment."


@router.post("/api/sms/inbound")
async def sms_inbound(Body: str = Form(default=""), From: str = Form(default="")):
    """Twilio SMS webhook — replies with TwiML."""
    logger.info(f"SMS from {From}: {Body!r}")
    reply = await _handle_inbound(Body, From, "sms")
    twiml = f'<?xml version="1.0" encoding="UTF-8"?><Response><Message>{reply}</Message></Response>'
    return Response(content=twiml, media_type="application/xml")


@router.post("/api/whatsapp/inbound")
async def whatsapp_inbound(Body: str = Form(default=""), From: str = Form(default="")):
    """Twilio WhatsApp webhook — replies with TwiML."""
    logger.info(f"WhatsApp from {From}: {Body!r}")
    reply = await _handle_inbound(Body, From, "whatsapp")
    twiml = f'<?xml version="1.0" encoding="UTF-8"?><Response><Message>{reply}</Message></Response>'
    return Response(content=twiml, media_type="application/xml")
