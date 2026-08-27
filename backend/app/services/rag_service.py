"""RAG pipeline over ChromaDB — IMD bulletins, fisheries advisories, aviation guides, etc."""
from __future__ import annotations

import logging

from app.core.config import settings

logger = logging.getLogger(__name__)

COLLECTION_NAME = "weathergpt_corpus"
CHUNK_SIZE = 500
CHUNK_OVERLAP = 50

DOCUMENT_CATEGORIES = [
    "IMD seasonal outlook", "Agro-met advisory bulletins", "District-wise climate normals",
    "RSMC cyclone advisories archive", "IMD glossary of weather terms",
    "IMD aviation weather METAR/TAF guide", "IMD Fisheries & Marine weather bulletins",
    "IMD urban heat island and smart city reports", "INCOIS fishing zone weather advisories",
    "IMD Fishermen Alert bulletins",
]

_client = None
_collection = None


def _get_collection():
    global _client, _collection
    if _collection is not None:
        return _collection
    import chromadb
    _client = chromadb.HttpClient(host=settings.CHROMADB_HOST, port=settings.CHROMADB_PORT)
    _collection = _client.get_or_create_collection(COLLECTION_NAME)
    return _collection


def _chunk_text(text: str, size: int = CHUNK_SIZE, overlap: int = CHUNK_OVERLAP) -> list[str]:
    chunks, start = [], 0
    while start < len(text):
        end = start + size
        chunks.append(text[start:end])
        start = end - overlap
    return chunks


async def ingest_document(text: str, source: str, domain: str, url: str = "") -> int:
    chunks = _chunk_text(text)
    try:
        collection = _get_collection()
        ids = [f"{source}-{i}" for i in range(len(chunks))]
        metadatas = [{"source": source, "page": i, "url": url, "domain": domain} for i in range(len(chunks))]
        collection.add(documents=chunks, ids=ids, metadatas=metadatas)
    except Exception as e:
        logger.warning(f"ChromaDB unavailable, ingest counted but not persisted: {e}")
    return len(chunks)


async def retrieve(query: str, n_results: int = 5) -> list[dict]:
    try:
        collection = _get_collection()
        result = collection.query(query_texts=[query], n_results=n_results)
        docs = result.get("documents", [[]])[0]
        metas = result.get("metadatas", [[]])[0]
        return [{"text": d, **m} for d, m in zip(docs, metas)]
    except Exception as e:
        logger.warning(f"RAG retrieve failed, returning empty context: {e}")
        return []
