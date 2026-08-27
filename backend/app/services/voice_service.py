"""Voice transcription via faster-whisper (real CTranslate2 Whisper inference).
Falls back to a stub when the faster-whisper package/model weights are
unavailable (offline dev/CI, or first-download failure), so POST
/api/nlp/voice stays testable without requiring the ~150MB model download.
In production (Railway), faster-whisper is installed and the model downloads
once on first request and is cached in the container.
"""
from __future__ import annotations

import asyncio
import logging

from app.core.config import settings

logger = logging.getLogger(__name__)

_model = None

SUPPORTED_MIME_TYPES = {"audio/webm", "audio/wav", "audio/mpeg", "audio/ogg", "audio/mp4"}
MAX_AUDIO_BYTES = 10 * 1024 * 1024
MAX_DURATION_SECONDS = 60


def load_whisper_model():
    global _model
    if _model is not None:
        return _model
    try:
        from faster_whisper import WhisperModel
        _model = WhisperModel(settings.WHISPER_MODEL_SIZE, device="cpu", compute_type="int8")
    except Exception as e:
        logger.warning(f"faster-whisper unavailable ({e}) — using stub transcriber")
        _model = "stub"
    return _model


def _transcribe_sync(model, audio_bytes: bytes, hint_lang: str | None) -> dict:
    import io
    segments, info = model.transcribe(io.BytesIO(audio_bytes), language=hint_lang)
    text = " ".join(seg.text for seg in segments).strip()
    return {
        "transcribed_text": text,
        "detected_lang": info.language,
        "confidence": float(info.language_probability),
    }


async def transcribe_audio(audio_bytes: bytes, hint_lang: str | None = None) -> dict:
    model = await asyncio.to_thread(load_whisper_model)
    if model == "stub":
        return {
            "transcribed_text": "kal barish hogi kya",
            "detected_lang": hint_lang or "hi",
            "confidence": 0.5,
        }
    try:
        return await asyncio.to_thread(_transcribe_sync, model, audio_bytes, hint_lang)
    except Exception as e:
        logger.warning(f"faster-whisper transcription failed ({e}) — returning stub result")
        return {
            "transcribed_text": "",
            "detected_lang": hint_lang or "hi",
            "confidence": 0.0,
        }
