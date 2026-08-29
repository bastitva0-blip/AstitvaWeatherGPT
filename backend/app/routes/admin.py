from __future__ import annotations

from collections import Counter

from fastapi import APIRouter, Depends, UploadFile
from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.auth import verify_api_key
from app.core.cache import get_redis
from app.models.database import HallucinationLog, LocationCache, Query as QueryRow, Session as SessionRow, User, get_db
from app.services import rag_service

router = APIRouter()


@router.get("/api/admin/stats")
async def admin_stats(api_key: str = Depends(verify_api_key), db: AsyncSession = Depends(get_db)):
    """Query-history analytics for the requesting user's own API key — see
    frontend prompt section 25. Scoped to `api_key` so one user's dashboard
    never surfaces another user's queries."""
    user = (await db.execute(select(User).where(User.apiKey == api_key))).scalar_one_or_none()
    if user is None:
        return {
            "total_queries": 0, "intent_distribution": {}, "top_locations": [],
            "recent_queries": [], "hallucination_logs": [],
        }

    session_ids = [s.id for s in (await db.execute(select(SessionRow).where(SessionRow.userId == user.id))).scalars().all()]
    if not session_ids:
        queries = []
    else:
        queries = (
            await db.execute(
                select(QueryRow).where(QueryRow.sessionId.in_(session_ids)).order_by(QueryRow.createdAt.desc())
            )
        ).scalars().all()

    intent_counts = Counter(q.intent for q in queries)
    location_counts = Counter((q.slots or {}).get("location") for q in queries if (q.slots or {}).get("location"))
    query_ids = {q.id for q in queries}
    hallucination_logs = (
        (await db.execute(select(HallucinationLog).order_by(HallucinationLog.createdAt.desc()).limit(200)))
        .scalars().all()
    )

    return {
        "total_queries": len(queries),
        "intent_distribution": dict(intent_counts),
        "top_locations": [{"location": loc, "count": count} for loc, count in location_counts.most_common(10)],
        "recent_queries": [
            {
                "id": q.id, "message": q.message, "intent": q.intent,
                "location": (q.slots or {}).get("location", ""), "lang": q.lang,
                "input_mode": q.inputMode, "created_at": q.createdAt.isoformat(),
            }
            for q in queries[:100]
        ],
        "hallucination_logs": [
            {"id": h.id, "query_id": h.queryId, "issue": h.issue, "created_at": h.createdAt.isoformat()}
            for h in hallucination_logs
            if h.queryId in query_ids
        ],
    }


@router.post("/api/admin/ingest")
async def ingest(file: UploadFile, domain: str = "general", api_key: str = Depends(verify_api_key)):
    content = (await file.read()).decode("utf-8", errors="ignore")
    n_chunks = await rag_service.ingest_document(content, source=file.filename or "upload", domain=domain)
    return {"source": file.filename, "domain": domain, "chunks_ingested": n_chunks}


@router.delete("/api/admin/location-cache/{name}")
async def purge_location_cache(name: str, api_key: str = Depends(verify_api_key), db: AsyncSession = Depends(get_db)):
    """Purge a bad GIS geocoding cache entry AND the Redis weather cache
    keyed by that location name. A wrong-city mismatch survives a geocoding
    code fix until both are purged: resolve_location checks the Postgres
    LocationCache before re-geocoding, and fetch_weather separately caches
    the (previously wrong-location) weather blob in Redis by name — deleting
    only one of the two still serves stale data from the other."""
    normalized = name.strip().lower()
    result = await db.execute(delete(LocationCache).where(LocationCache.name == normalized))
    await db.commit()

    redis = get_redis()
    weather_keys_deleted = 0
    async for key in redis.scan_iter(match=f"weather:v2:{normalized}:*"):
        await redis.delete(key)
        weather_keys_deleted += 1

    return {
        "name": normalized,
        "location_cache_rows_deleted": result.rowcount,
        "weather_cache_keys_deleted": weather_keys_deleted,
    }
