"""
Whisper speech-to-text service.
Runs locally — no API key required. Patient audio never leaves the network.
"""
import logging
import tempfile
import os
import subprocess
from dataclasses import dataclass
from typing import Optional

logger = logging.getLogger(__name__)

# ffmpeg path — try system PATH first, then known winget install location
FFMPEG_CANDIDATES = [
    "ffmpeg",
    r"C:\Users\Administrator\AppData\Local\Microsoft\WinGet\Packages\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\ffmpeg-8.1.1-full_build\bin\ffmpeg.exe",
]

def _find_ffmpeg() -> Optional[str]:
    for cmd in FFMPEG_CANDIDATES:
        try:
            r = subprocess.run([cmd, "-version"], capture_output=True, timeout=5)
            if r.returncode == 0:
                return cmd
        except (FileNotFoundError, subprocess.TimeoutExpired):
            continue
    return None

FFMPEG = _find_ffmpeg()
if FFMPEG:
    logger.info("ffmpeg found: %s", FFMPEG)
else:
    logger.warning("ffmpeg not found — WebM audio may fail to decode")


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
        wav_path = None
        try:
            # Write to temp file — Whisper requires a file path, not bytes
            with tempfile.NamedTemporaryFile(suffix=".webm", delete=False) as tmp:
                tmp.write(audio_bytes)
                tmp_path = tmp.name

            # Convert WebM → WAV using ffmpeg (Whisper decodes WAV natively)
            audio_path = tmp_path
            if FFMPEG:
                wav_path = tmp_path.replace(".webm", ".wav")
                result_conv = subprocess.run(
                    [FFMPEG, "-y", "-i", tmp_path, "-ar", "16000", "-ac", "1", "-f", "wav", wav_path],
                    capture_output=True, timeout=60,
                )
                if result_conv.returncode == 0:
                    audio_path = wav_path
                else:
                    logger.warning("ffmpeg conversion failed, using raw webm")

            result = self._model.transcribe(
                audio_path,
                language=language,
                task="transcribe",
                fp16=False,
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
            # Always clean up temp files — never conditional on success
            for path in [tmp_path, wav_path]:
                if path and os.path.exists(path):
                    try:
                        os.unlink(path)
                    except Exception:
                        pass
