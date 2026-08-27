from __future__ import annotations

from fastapi import APIRouter, Depends, UploadFile
from sqlalchemy import delete

from app.core.auth import verify_api_key
from app.models.database import LocationCache, get_db
from app.services import rag_service
from sqlalchemy.ext.asyncio import AsyncSession

router = APIRouter()


@router.post("/api/admin/ingest")
async def ingest(file: UploadFile, domain: str = "general", api_key: str = Depends(verify_api_key)):
    content = (await file.read()).decode("utf-8", errors="ignore")
    n_chunks = await rag_service.ingest_document(content, source=file.filename or "upload", domain=domain)
    return {"source": file.filename, "domain": domain, "chunks_ingested": n_chunks}


@router.delete("/api/admin/location-cache/{name}")
async def purge_location_cache(name: str, api_key: str = Depends(verify_api_key), db: AsyncSession = Depends(get_db)):
    """Purge a bad GIS geocoding cache entry — a wrong-city mismatch needs a
    code fix AND this, since resolve_location checks the DB cache before
    ever re-geocoding, so a stale/wrong entry survives any geocoding fix
    until purged."""
    result = await db.execute(delete(LocationCache).where(LocationCache.name == name.strip().lower()))
    await db.commit()
    return {"name": name, "rows_deleted": result.rowcount}
