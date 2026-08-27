"""Shared LLM client — NVIDIA NIM (OpenAI-compatible endpoint), Llama models.

Swapped in place of the Anthropic SDK: NVIDIA NIM exposes an OpenAI-compatible
chat.completions API at integrate.api.nvidia.com, so the `openai` SDK talks to
it directly via base_url. Callers just need chat_completion(system, user).
"""
from __future__ import annotations

import logging

from app.core.config import settings

logger = logging.getLogger(__name__)

_client = None


def is_configured() -> bool:
    return bool(settings.NVIDIA_API_KEY)


def get_client():
    global _client
    if _client is None:
        from openai import OpenAI
        _client = OpenAI(base_url=settings.NVIDIA_BASE_URL, api_key=settings.NVIDIA_API_KEY)
    return _client


def chat_completion(system: str, user: str, max_tokens: int = 1000, temperature: float = 0.2) -> str:
    client = get_client()
    response = client.chat.completions.create(
        model=settings.NVIDIA_MODEL,
        messages=[
            {"role": "system", "content": system},
            {"role": "user", "content": user},
        ],
        max_tokens=max_tokens,
        temperature=temperature,
    )
    return response.choices[0].message.content
