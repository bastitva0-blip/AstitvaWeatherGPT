from __future__ import annotations

from fastapi import APIRouter, Depends, UploadFile

from app.core.auth import verify_api_key
from app.services import rag_service

router = APIRouter()


@router.post("/api/admin/ingest")
async def ingest(file: UploadFile, domain: str = "general", api_key: str = Depends(verify_api_key)):
    content = (await file.read()).decode("utf-8", errors="ignore")
    n_chunks = await rag_service.ingest_document(content, source=file.filename or "upload", domain=domain)
    return {"source": file.filename, "domain": domain, "chunks_ingested": n_chunks}
