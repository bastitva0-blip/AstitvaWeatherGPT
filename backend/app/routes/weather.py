from __future__ import annotations

from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException

from app.core.auth import verify_api_key
from app.services import gis_service, weather_service

router = APIRouter()


@router.get("/api/weather/live")
async def weather_live(location: str, date: str | None = None, api_key: str = Depends(verify_api_key)):
    gis_location = await gis_service.resolve_location(location)
    if gis_location is None:
        raise HTTPException(status_code=404, detail=f"Could not resolve location: {location}")
    date_str = date or datetime.now(timezone.utc).date().isoformat()
    return await weather_service.fetch_weather(gis_location, date_str)
