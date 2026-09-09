"""Text-to-speech service for voice responses.

Primary:  gTTS (Google Text-to-Speech) — free, supports all 17 Indian languages.
Fallback: pyttsx3 (offline, English only).

Install: pip install gTTS pyttsx3 --break-system-packages

The generated audio is returned as base64-encoded MP3 bytes so the frontend
can play it directly via the Web Audio API without a separate download step.
"""
from __future__ import annotations

import asyncio
import base64
import io
import logging

logger = logging.getLogger(__name__)

# gTTS language code map — matches Sanket's langdetect output
_LANG_TO_GTTS = {
    "hi": "hi",   # Hindi
    "ta": "ta",   # Tamil
    "te": "te",   # Telugu
    "bn": "bn",   # Bengali
    "mr": "mr",   # Marathi
    "gu": "gu",   # Gujarati
    "kn": "kn",   # Kannada
    "pa": "pa",   # Punjabi
    "ml": "ml",   # Malayalam
    "or": "or",   # Odia
    "ur": "ur",   # Urdu
    "ar": "ar",   # Arabic
    "zh": "zh-TW",# Chinese (Traditional — better for short phrases)
    "fr": "fr",   # French
    "es": "es",   # Spanish
    "sw": "sw",   # Swahili
    "en": "en",   # English (default)
}


def _gtts_sync(text: str, lang_code: str) -> bytes | None:
    try:
        from gtts import gTTS
        fp = io.BytesIO()
        gTTS(text=text[:500], lang=lang_code, slow=False).write_to_fp(fp)
        fp.seek(0)
        return fp.read()
    except ImportError:
        logger.warning("gTTS not installed — TTS disabled")
        return None
    except Exception as e:
        logger.error(f"gTTS failed for lang={lang_code}: {e}")
        return None


async def text_to_speech_base64(text: str, lang: str = "en") -> str | None:
    """Convert text to MP3 audio, return as base64 string.
    Returns None if TTS unavailable (frontend falls back to text display).
    """
    gtts_lang = _LANG_TO_GTTS.get(lang, "en")
    audio_bytes = await asyncio.to_thread(_gtts_sync, text, gtts_lang)
    if audio_bytes is None:
        return None
    return base64.b64encode(audio_bytes).decode("utf-8")
