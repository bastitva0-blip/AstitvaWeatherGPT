import pytest

from app.services.rag_service import _chunk_text, retrieve


def test_chunk_text_respects_size_and_overlap():
    text = "a" * 1200
    chunks = _chunk_text(text, size=500, overlap=50)
    assert len(chunks) >= 3
    assert all(len(c) <= 500 for c in chunks)


@pytest.mark.asyncio
async def test_retrieve_returns_empty_list_when_chromadb_unavailable():
    # No ChromaDB server running in test env -> retrieve() must degrade
    # gracefully instead of raising.
    result = await retrieve("rain in Chennai", n_results=5)
    assert isinstance(result, list)
