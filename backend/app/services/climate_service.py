"""Climate trend and historical analysis.

Priority order: ClimateRecord DB rows (curated/verified data, if seeded) ->
Open-Meteo's historical archive API (real reanalysis data, free, no key,
worldwide coverage — closes the "empty ClimateRecord table" gap where every
trend query previously returned "no data") -> RAG corpus -> honest "no data".
"""
from __future__ import annotations

import logging
from collections import defaultdict
from datetime import datetime, timezone

import httpx
from scipy import stats
from sqlalchemy import select

from app.models.database import ClimateRecord, get_session_factory
from app.services import rag_service
from app.services.gis_service import resolve_location

logger = logging.getLogger(__name__)

ARCHIVE_URL = "https://archive-api.open-meteo.com/v1/archive"

_PARAMETER_TO_DAILY_VAR = {
    "rainfall": "precipitation_sum",
    "temperature": "temperature_2m_mean",
    "humidity": "relativehumidity_2m_mean",
}


async def _fetch_open_meteo_history(location: str, parameter: str, start_year: int, end_year: int) -> dict | None:
    daily_var = _PARAMETER_TO_DAILY_VAR.get(parameter)
    if daily_var is None:
        return None

    loc = await resolve_location(location)
    if loc is None:
        return None

    try:
        async with httpx.AsyncClient() as client:
            resp = await client.get(
                ARCHIVE_URL,
                params={
                    "latitude": loc.lat, "longitude": loc.lon,
                    "start_date": f"{start_year}-01-01", "end_date": f"{end_year}-12-31",
                    "daily": daily_var, "timezone": "UTC",
                },
                timeout=20.0,
            )
            if resp.status_code != 200:
                return None
            data = resp.json()
    except Exception as e:
        logger.warning(f"Open-Meteo archive fetch failed for {location}: {e}")
        return None

    times = data.get("daily", {}).get("time", [])
    values = data.get("daily", {}).get(daily_var, [])
    by_year: dict[int, list[float]] = defaultdict(list)
    for t, v in zip(times, values):
        if v is not None:
            by_year[int(t[:4])].append(v)

    if not by_year:
        return None

    aggregate = sum if parameter == "rainfall" else (lambda xs: sum(xs) / len(xs))
    yearly = [{"year": y, "value": round(aggregate(vals), 2)} for y, vals in sorted(by_year.items())]
    unit = "mm" if parameter == "rainfall" else "C"
    return {"data": yearly, "unit": unit}


async def get_climate_trend(location: str, parameter: str, start_year: int | None = None,
                             end_year: int | None = None, granularity: str = "annual") -> dict:
    factory = get_session_factory()
    async with factory() as db:
        query = select(ClimateRecord).where(
            ClimateRecord.location == location, ClimateRecord.parameter == parameter
        )
        if start_year:
            query = query.where(ClimateRecord.year >= start_year)
        if end_year:
            query = query.where(ClimateRecord.year <= end_year)
        rows = (await db.execute(query.order_by(ClimateRecord.year))).scalars().all()

    if rows:
        years = [r.year for r in rows]
        values = [r.value for r in rows]
        slope, intercept, r, p, se = stats.linregress(years, values)
        direction = "increasing" if slope > 0 else ("decreasing" if slope < 0 else "stable")
        return {
            "location": location,
            "parameter": parameter,
            "unit": rows[0].unit,
            "granularity": granularity,
            "data": [{"year": r.year, "value": r.value} for r in rows],
            "trend": {"direction": direction, "change_per_decade": round(slope * 10, 2)},
            "citations": [{"source": r.source, "detail": f"{r.year} {parameter}", "url": ""} for r in rows[:1]],
        }

    current_year = datetime.now(timezone.utc).year
    resolved_start = start_year or (current_year - 10)
    resolved_end = min(end_year or (current_year - 1), current_year - 1)  # archive API has no current-year data
    om_result = await _fetch_open_meteo_history(location, parameter, resolved_start, resolved_end)

    if om_result and len(om_result["data"]) >= 2:
        years = [d["year"] for d in om_result["data"]]
        values = [d["value"] for d in om_result["data"]]
        slope, intercept, r, p, se = stats.linregress(years, values)
        direction = "increasing" if slope > 0 else ("decreasing" if slope < 0 else "stable")
        return {
            "location": location,
            "parameter": parameter,
            "unit": om_result["unit"],
            "granularity": granularity,
            "data": om_result["data"],
            "trend": {"direction": direction, "change_per_decade": round(slope * 10, 2)},
            "citations": [{
                "source": "Open-Meteo Historical Archive (reanalysis)",
                "detail": f"{parameter} {resolved_start}-{resolved_end} for {location}",
                "url": ARCHIVE_URL,
            }],
        }

    rag_chunks = await rag_service.retrieve(f"{parameter} trend {location}", n_results=3)
    return {
        "location": location, "parameter": parameter, "unit": "mm" if parameter == "rainfall" else "unit",
        "granularity": granularity, "data": [],
        "trend": {"direction": "unknown", "change_per_decade": 0.0},
        "citations": [{"source": c.get("source", "IMD RAG corpus"), "detail": c.get("text", "")[:120],
                        "url": c.get("url", "")} for c in rag_chunks] or
                     [{"source": "IMD", "detail": "no historical records found", "url": "https://mausam.imd.gov.in"}],
    }
