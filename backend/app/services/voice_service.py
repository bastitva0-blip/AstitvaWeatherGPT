"""Voice transcription via faster-whisper. Falls back to a stub when the
faster-whisper package/model weights are unavailable (offline dev/CI), so
POST /api/nlp/voice stays testable without a multi-hundred-MB download.
"""
from __future__ import annotations

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


async def transcribe_audio(audio_bytes: bytes, hint_lang: str | None = None) -> dict:
    model = load_whisper_model()
    if model == "stub":
        return {
            "transcribed_text": "kal barish hogi kya",
            "detected_lang": hint_lang or "hi",
            "confidence": 0.5,
        }

    import io
    segments, info = model.transcribe(io.BytesIO(audio_bytes), language=hint_lang)
    text = " ".join(seg.text for seg in segments).strip()
    return {
        "transcribed_text": text,
        "detected_lang": info.language,
        "confidence": float(info.language_probability),
    }
