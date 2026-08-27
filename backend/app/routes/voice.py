from __future__ import annotations

from fastapi import APIRouter, Depends, Form, HTTPException, UploadFile

from app.core.auth import verify_api_key
from app.models.schemas import VoiceTranscribeResponse
from app.services import voice_service

router = APIRouter()


@router.post("/api/nlp/voice", response_model=VoiceTranscribeResponse)
async def voice_transcribe(
    audio: UploadFile,
    hint_lang: str = Form(default=None),
    session_id: str = Form(default="default"),
    api_key: str = Depends(verify_api_key),
):
    if audio.content_type not in voice_service.SUPPORTED_MIME_TYPES:
        raise HTTPException(status_code=415, detail=f"Unsupported audio format: {audio.content_type}")

    if audio.size is not None and audio.size > voice_service.MAX_AUDIO_BYTES:
        raise HTTPException(status_code=413, detail="Audio file exceeds 10MB limit")

    body = await audio.read()
    if len(body) > voice_service.MAX_AUDIO_BYTES:
        raise HTTPException(status_code=413, detail="Audio file exceeds 10MB limit")

    result = await voice_service.transcribe_audio(body, hint_lang)
    return VoiceTranscribeResponse(
        transcribed_text=result["transcribed_text"],
        detected_lang=result["detected_lang"],
        confidence=result["confidence"],
        session_id=session_id,
    )
