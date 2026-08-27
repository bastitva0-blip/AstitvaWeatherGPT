"""Climate trend and historical analysis over ClimateRecord + RAG fallback."""
from __future__ import annotations

from scipy import stats
from sqlalchemy import select

from app.models.database import ClimateRecord, get_session_factory
from app.services import rag_service


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

    if not rows:
        rag_chunks = await rag_service.retrieve(f"{parameter} trend {location}", n_results=3)
        return {
            "location": location, "parameter": parameter, "unit": "mm" if parameter == "rainfall" else "unit",
            "granularity": granularity, "data": [],
            "trend": {"direction": "unknown", "change_per_decade": 0.0},
            "citations": [{"source": c.get("source", "IMD RAG corpus"), "detail": c.get("text", "")[:120],
                            "url": c.get("url", "")} for c in rag_chunks] or
                         [{"source": "IMD", "detail": "no historical records found", "url": "https://mausam.imd.gov.in"}],
        }

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
