"""Shared LLM client — local Qwen (Ollama) with NVIDIA NIM fallback.

Priority when LOCAL_LLM_ENABLED=true: local Qwen 2.5 7B via Ollama, then NVIDIA
NIM (OpenAI-compatible endpoint) as fallback. When LOCAL_LLM_ENABLED=false
(default — e.g. Railway), NIM is used directly. Empty answer/"deterministic"
source means llm_service falls back to its own template answer.
"""
from __future__ import annotations

import logging
import os
import socket

from openai import AsyncOpenAI

from app.core.config import settings

logger = logging.getLogger(__name__)

_local_client = AsyncOpenAI(
    base_url=os.getenv("OLLAMA_BASE_URL", "http://localhost:11434/v1"),
    api_key="ollama",
)
LOCAL_MODEL = os.getenv("LOCAL_MODEL", "qwen2.5:7b-instruct")
LOCAL_ENABLED = os.getenv("LOCAL_LLM_ENABLED", "false").lower() == "true"

_nim_client = AsyncOpenAI(
    base_url=settings.NVIDIA_BASE_URL,
    api_key=settings.NVIDIA_API_KEY or "no-key",
)
NIM_MODEL = settings.NVIDIA_MODEL


def is_configured() -> bool:
    return bool(settings.NVIDIA_API_KEY) or LOCAL_ENABLED


def _ollama_reachable() -> bool:
    host = os.getenv("OLLAMA_HOST", "localhost")
    try:
        with socket.create_connection((host, 11434), timeout=0.5):
            return True
    except OSError:
        return False


async def chat_completion(system: str, user: str, max_tokens: int = 400) -> tuple[str, str]:
    """Returns (answer_text, llm_source)."""

    if LOCAL_ENABLED:
        if _ollama_reachable():
            try:
                resp = await _local_client.chat.completions.create(
                    model=LOCAL_MODEL,
                    messages=[
                        {"role": "system", "content": system},
                        {"role": "user", "content": user},
                    ],
                    max_tokens=max_tokens,
                    temperature=0.2,
                    timeout=8.0,
                )
                logger.info("llm: qwen2.5-7b local (Ollama)")
                return resp.choices[0].message.content.strip(), "qwen-local"
            except Exception as e:
                logger.warning(f"local LLM failed ({e}) — falling back to NIM")
        else:
            logger.warning("Ollama not reachable — skipping local, using NIM")

    if settings.NVIDIA_API_KEY:
        try:
            resp = await _nim_client.chat.completions.create(
                model=NIM_MODEL,
                messages=[
                    {"role": "system", "content": system},
                    {"role": "user", "content": user},
                ],
                max_tokens=max_tokens,
                temperature=0.2,
                timeout=15.0,
            )
            source = "nvidia-nim-fallback" if LOCAL_ENABLED else "nvidia-nim"
            logger.info(f"llm: {source}")
            return resp.choices[0].message.content.strip(), source
        except Exception as e:
            logger.warning(f"NIM failed ({e}) — deterministic fallback")

    logger.error("all LLM options exhausted — deterministic fallback")
    return "", "deterministic"
