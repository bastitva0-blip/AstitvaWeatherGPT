from __future__ import annotations

import asyncio
from datetime import datetime, timezone

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.auth import verify_api_key
from app.models.database import Query as QueryRow, Session as SessionRow, User, get_db
from app.models.schemas import QueryRequest, QueryResponse
from app.services import (
    agro_service, aqi_service, aviation_service, gfs_service, gis_service,
    llm_service, nlp_service, rag_service, weather_service,
)
from app.services.climate_service import get_climate_trend

router = APIRouter()


async def _ensure_session(db: AsyncSession, session_id: str, api_key: str, lang: str) -> None:
    from sqlalchemy import select

    user = (await db.execute(select(User).where(User.apiKey == api_key))).scalar_one_or_none()
    if user is None:
        user = User(apiKey=api_key)
        db.add(user)
        await db.flush()

    session = (await db.execute(select(SessionRow).where(SessionRow.id == session_id))).scalar_one_or_none()
    if session is None:
        session = SessionRow(id=session_id, userId=user.id, lang=lang)
        db.add(session)
        await db.flush()


@router.post("/api/query", response_model=QueryResponse)
async def query(body: QueryRequest, api_key: str = Depends(verify_api_key), db: AsyncSession = Depends(get_db)):
    nlp_result = await nlp_service.nlp_pipeline(body.message)

    if nlp_result["intent"] == "clarification_needed":
        clarification = await asyncio.to_thread(
            nlp_service.translate_from_english,
            "Could you clarify your location and what weather info you need?", nlp_result["lang"],
        )
        return QueryResponse(
            answer=clarification,
            citations=[{"source": "WeatherGPT", "detail": "clarification requested", "url": ""}],
            weather_summary={"location": "unknown", "date": "unknown"},
            alert_level="none",
            use_case_context="general",
        )

    if nlp_result["intent"] == "climate_trend":
        trend = await get_climate_trend(
            location=nlp_result["slots"].get("location") or body.location_hint or "India",
            parameter=nlp_result["slots"].get("weather_parameter") or "rainfall",
        )
        return QueryResponse(
            answer=f"Climate trend for {trend['location']}: {trend['trend']['direction']} "
                   f"({trend['trend']['change_per_decade']}/decade)",
            citations=trend["citations"],
            weather_summary={"location": trend["location"], "date": "trend"},
            alert_level="none",
            use_case_context="researcher",
        )

    if nlp_result["intent"] == "aviation_briefing":
        icao_code = nlp_result["slots"].get("icao_code")
        metar = await aviation_service.fetch_metar(icao_code) if icao_code else None
        if metar is None:
            return QueryResponse(
                answer="Please provide a 4-letter ICAO airport code (e.g. VIDP for Delhi) for an aviation briefing.",
                citations=[{"source": "WeatherGPT", "detail": "no ICAO code resolved", "url": ""}],
                weather_summary={"location": icao_code or "unknown", "date": "unknown"},
                alert_level="none",
                use_case_context="aviation",
            )
        answer = (
            f"{metar['station_name']}: {metar['flight_category']} conditions, "
            f"wind {metar['wind_direction_deg']}@{metar['wind_speed_kt']}kt, "
            f"visibility {metar['visibility_sm']}sm, QNH {metar['qnh_hpa']}hPa, "
            f"temperature {metar['temperature_c']}C. Raw METAR: {metar['raw_metar']}"
        )
        return QueryResponse(
            answer=answer,
            citations=[{"source": metar["source"], "detail": f"Live METAR for {metar['icao_code']}", "url": metar["source_url"]}],
            weather_summary={"location": metar["station_name"], "date": metar["observed_at"], "condition": metar["flight_category"]},
            alert_level="none",
            use_case_context="aviation",
        )

    location_name = nlp_result["slots"].get("location") or body.location_hint or "Delhi"
    gis_location = await gis_service.resolve_location(location_name)
    if gis_location is None:
        from app.models.schemas import GISLocation
        gis_location = GISLocation(name=location_name, lat=28.61, lon=77.20, geohash="tttt", source="nominatim")

    date_str = nlp_result["slots"].get("date") or datetime.now(timezone.utc).date().isoformat()

    coastal_task = (
        gis_service.get_coastal_zone(gis_location.lat, gis_location.lon)
        if nlp_result["intent"] == "marine_advisory" else asyncio.sleep(0, result=None)
    )
    aqi_task = (
        aqi_service.fetch_aqi(gis_location.lat, gis_location.lon)
        if nlp_result["intent"] == "urban_monitoring" else asyncio.sleep(0, result=None)
    )

    weather_data, gfs_data, rag_chunks, coastal_info, aqi_data = await asyncio.gather(
        weather_service.fetch_weather(gis_location, date_str),
        gfs_service.get_gfs_extended_forecast(gis_location.name, days=1),
        rag_service.retrieve(nlp_result["en_text"], n_results=5),
        coastal_task,
        aqi_task,
    )
    if coastal_info:
        weather_data["coastal_zone"] = coastal_info

    extra_facts = None
    extra_citations = None
    if aqi_data:
        extra_facts = (
            f"Air Quality Index: {aqi_data['aqi_label']} (OWM index {aqi_data['aqi_index']}/5), "
            f"PM2.5: {aqi_data['pm2_5']}ug/m3, PM10: {aqi_data['pm10']}ug/m3"
        )
        extra_citations = [{"source": aqi_data["source"], "detail": "Live air quality data", "url": aqi_data["source_url"]}]
    elif nlp_result["intent"] == "agro_advisory":
        advisory = agro_service.get_agro_advisory(nlp_result["slots"].get("crop_type"), weather_data)
        if advisory:
            extra_facts = advisory

    llm_response = await llm_service.generate(
        weather_data, rag_chunks, nlp_result, gfs_data, extra_facts=extra_facts, extra_citations=extra_citations
    )
    llm_response["answer"] = await asyncio.to_thread(
        nlp_service.translate_from_english, llm_response["answer"], nlp_result["lang"]
    )

    await _ensure_session(db, body.session_id, api_key, nlp_result["lang"])
    row = QueryRow(
        sessionId=body.session_id,
        message=body.message,
        enText=nlp_result["en_text"],
        intent=nlp_result["intent"],
        slots=nlp_result["slots"],
        response=llm_response["answer"],
        citations=llm_response["citations"],
        lang=nlp_result["lang"],
        inputMode=body.input_mode,
    )
    db.add(row)
    await db.commit()

    return QueryResponse(**llm_response)
