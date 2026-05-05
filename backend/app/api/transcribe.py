"""
POST /api/transcribe — Audio upload and Whisper transcription endpoint.
"""
import logging
from typing import Optional

from fastapi import APIRouter, File, Form, HTTPException, Request, UploadFile
from pydantic import BaseModel

from app.core.config import settings
from app.services.whisper import WhisperService

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api", tags=["transcription"])

whisper_service = WhisperService()


class TranscriptionResponse(BaseModel):
    transcript: str
    language: str
    status: str  # "ok" | "no_speech_detected"


@router.post("/transcribe", response_model=TranscriptionResponse)
async def transcribe_audio(
    request: Request,
    audio: UploadFile = File(..., description="Audio recording (WebM/Opus)"),
    language: Optional[str] = Form(None, description="BCP-47 language code, e.g. 'sw' or 'en'. Omit for auto-detection."),
) -> TranscriptionResponse:
    """
    Transcribe an audio recording using local Whisper.

    - Accepts WebM/Opus audio from the browser MediaRecorder API
    - Auto-detects language if not specified (supports Swahili + English)
    - Returns transcript, detected language, and status
    - Phase 7 hook: audit log — request received (no content logged)
    """
    # File size check — reject before reading full body
    content_length = request.headers.get("content-length")
    if content_length and int(content_length) > settings.max_upload_bytes:
        raise HTTPException(
            status_code=413,
            detail=f"Audio file exceeds {settings.max_upload_bytes // (1024*1024)} MB limit",
        )

    # Phase 7 hook: audit log
    logger.info("transcribe request received, content_length=%s, language=%s", content_length, language)

    try:
        audio_bytes = await audio.read()

        # Secondary size check (in case Content-Length header was absent)
        if len(audio_bytes) > settings.max_upload_bytes:
            raise HTTPException(
                status_code=413,
                detail=f"Audio file exceeds {settings.max_upload_bytes // (1024*1024)} MB limit",
            )

        result = await whisper_service.transcribe(audio_bytes, language=language)

        return TranscriptionResponse(
            transcript=result.transcript,
            language=result.language,
            status=result.status,
        )

    except HTTPException:
        raise
    except Exception as exc:
        logger.error("Transcription failed: %s", exc)
        raise HTTPException(
            status_code=422,
            detail=f"Audio file could not be processed: {exc}",
        )
