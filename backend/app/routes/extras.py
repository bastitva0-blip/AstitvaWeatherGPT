"""Extra routes: TTS, crop calendar, 7-day forecast, share card."""
from __future__ import annotations
from fastapi import APIRouter, Depends, Query
from app.core.auth import verify_api_key
from app.services.tts_service import text_to_speech_base64
from app.services.crop_calendar_service import get_crop_calendar, get_current_advisory
from app.services.gfs_service import get_gfs_extended_forecast

router = APIRouter()


@router.post("/api/tts")
async def tts(text: str, lang: str = "en", _: str = Depends(verify_api_key)):
    """Convert text answer to speech. Returns base64 MP3."""
    audio_b64 = await text_to_speech_base64(text, lang)
    if audio_b64 is None:
        return {"audio_base64": None, "error": "TTS unavailable"}
    return {"audio_base64": audio_b64, "format": "mp3", "lang": lang}


@router.get("/api/crop-calendar")
async def crop_calendar(crop: str = Query(...), _: str = Depends(verify_api_key)):
    """Full 12-month crop calendar for a given crop."""
    return get_crop_calendar(crop)


@router.get("/api/crop-calendar/current")
async def crop_advisory_now(crop: str = Query(...), _: str = Depends(verify_api_key)):
    """Just this month's advisory for quick chat integration."""
    return get_current_advisory(crop)


@router.get("/api/forecast/7day")
async def seven_day_forecast(location: str = Query(...), _: str = Depends(verify_api_key)):
    """7-day GFS forecast cards for a location."""
    days = await get_gfs_extended_forecast(location, days=7)
    return {"location": location, "days": len(days), "forecast": days}


@router.get("/api/district")
async def district_info(location: str = Query(...), _: str = Depends(verify_api_key)):
    """Resolve a location to full district/state/tehsil detail."""
    from app.services.gis_service import resolve_location
    loc = await resolve_location(location)
    if loc is None:
        return {"error": f"Could not resolve location: {location}"}
    return {
        "name":       loc.name,
        "district":   loc.district,
        "state":      loc.state,
        "country":    loc.country,
        "lat":        loc.lat,
        "lon":        loc.lon,
        "geohash":    loc.geohash,
        "coastal_zone": loc.coastal_zone,
        "source":     loc.source,
    }


@router.get("/api/imd/supported-cities")
async def imd_cities(_: str = Depends(verify_api_key)):
    """List of cities with direct IMD data (no OWM proxy lag)."""
    from app.services.imd_service import get_supported_imd_cities
    return {"cities": get_supported_imd_cities(), "count": len(get_supported_imd_cities())}


@router.get("/api/imd/weather")
async def imd_weather_direct(location: str = Query(...), _: str = Depends(verify_api_key)):
    """Raw IMD weather for a city — direct from mausam.imd.gov.in."""
    from app.services.imd_service import fetch_imd_weather
    data = await fetch_imd_weather(location)
    if data is None:
        return {"error": f"'{location}' not in IMD city list or IMD API unavailable. Try /api/imd/supported-cities"}
    return data
