from __future__ import annotations

from fastapi import APIRouter, Depends, UploadFile
from sqlalchemy import delete
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.auth import verify_api_key
from app.core.cache import get_redis
from app.models.database import LocationCache, get_db
from app.services import rag_service

router = APIRouter()


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
