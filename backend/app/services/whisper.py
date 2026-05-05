"""
Whisper speech-to-text service.
Runs locally — no API key required. Patient audio never leaves the network.
"""
import logging
import tempfile
import os
from dataclasses import dataclass
from typing import Optional

logger = logging.getLogger(__name__)


@dataclass
class TranscriptionResult:
    transcript: str
    language: str
    status: str  # "ok" | "no_speech_detected" | "error"


class WhisperService:
    """Singleton wrapper around the local Whisper model."""

    _model = None  # loaded once at startup

    @classmethod
    def load_model(cls, model_name: str = "base") -> None:
        """Load Whisper model into memory at startup. Call once via lifespan."""
        import whisper
        logger.info("Loading Whisper model: %s", model_name)
        cls._model = whisper.load_model(model_name)
        logger.info("Whisper model loaded successfully")

    async def transcribe(
        self,
        audio_bytes: bytes,
        language: Optional[str] = None,
    ) -> TranscriptionResult:
        """
        Transcribe audio bytes using the local Whisper model.

        Args:
            audio_bytes: Raw audio data (WebM/Opus from browser)
            language: BCP-47 language code (e.g. "sw", "en").
                      Pass None for automatic language detection.

        Returns:
            TranscriptionResult with transcript, detected language, and status.
        """
        if self._model is None:
            raise RuntimeError("WhisperService: model not loaded. Call load_model() at startup.")

        tmp_path = None
        try:
            # Write to temp file — Whisper requires a file path, not bytes
            with tempfile.NamedTemporaryFile(suffix=".webm", delete=False) as tmp:
                tmp.write(audio_bytes)
                tmp_path = tmp.name

            result = self._model.transcribe(
                tmp_path,
                language=language,
                task="transcribe",
            )

            transcript = result.get("text", "").strip()
            detected_lang = result.get("language", language or "unknown")

            # Phase 5 hook: diarization — label segments by speaker here
            # segments = result.get("segments", [])

            # Phase 2 hook: translation middleware — pass transcript to translator here
            # if detected_lang != "en": transcript = await translate(transcript, detected_lang)

            if not transcript:
                return TranscriptionResult(
                    transcript="",
                    language=detected_lang,
                    status="no_speech_detected",
                )

            return TranscriptionResult(
                transcript=transcript,
                language=detected_lang,
                status="ok",
            )

        except Exception as exc:
            logger.error("Whisper transcription failed: %s", exc)
            raise

        finally:
            # Always clean up temp file — never conditional on success
            if tmp_path and os.path.exists(tmp_path):
                os.unlink(tmp_path)
