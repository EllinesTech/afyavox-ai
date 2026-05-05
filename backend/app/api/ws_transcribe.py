"""
WebSocket /ws/transcribe — Real-time streaming transcription.

The doctor sees text appearing live as they speak.
Flow:
  1. Browser connects via WebSocket
  2. Browser sends audio chunks (binary) every 2 seconds while recording
  3. Server runs Whisper on each chunk and streams partial transcripts back
  4. Browser appends each partial to the live transcript panel
  5. On disconnect, final transcript is complete

Note: Requires ffmpeg to be installed for WebM/Opus decoding.
      Install: winget install Gyan.FFmpeg
"""
import logging
import os
import subprocess
import sys
import tempfile
from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from app.services.whisper import WhisperService

logger = logging.getLogger(__name__)
router = APIRouter(tags=["streaming"])

whisper_service = WhisperService()


FFMPEG_PATH = r"C:\Users\Administrator\AppData\Local\Microsoft\WinGet\Packages\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\ffmpeg-8.1.1-full_build\bin\ffmpeg.exe"


def _check_ffmpeg() -> str | None:
    """Return ffmpeg executable path if available, else None."""
    # Try system PATH first
    for cmd in ["ffmpeg", FFMPEG_PATH]:
        try:
            result = subprocess.run(
                [cmd, "-version"],
                capture_output=True,
                timeout=5,
            )
            if result.returncode == 0:
                return cmd
        except (FileNotFoundError, subprocess.TimeoutExpired):
            continue
    return None


def _convert_webm_to_wav(ffmpeg_cmd: str, webm_path: str, wav_path: str) -> bool:
    """Convert WebM/Opus to WAV using ffmpeg. Returns True on success."""
    try:
        result = subprocess.run(
            [
                ffmpeg_cmd, "-y",
                "-i", webm_path,
                "-ar", "16000",   # 16kHz sample rate (Whisper optimal)
                "-ac", "1",       # mono
                "-f", "wav",
                wav_path,
            ],
            capture_output=True,
            timeout=30,
        )
        return result.returncode == 0
    except Exception as exc:
        logger.error("ffmpeg conversion failed: %s", exc)
        return False


@router.websocket("/ws/transcribe")
async def ws_transcribe(websocket: WebSocket):
    """
    Real-time streaming transcription via WebSocket.

    Protocol:
      Client → Server: binary audio chunks (WebM/Opus)
      Server → Client: JSON {"type": "partial", "text": "...", "language": "...", "full": "..."}
      Server → Client: JSON {"type": "done", "full": "..."}
      Server → Client: JSON {"type": "error", "message": "..."}
    """
    await websocket.accept()
    logger.info("WebSocket transcription session started")

    # Check ffmpeg availability once per session
    ffmpeg_cmd = _check_ffmpeg()
    if not ffmpeg_cmd:
        logger.warning("ffmpeg not found on PATH or known location")
        await websocket.send_json({
            "type": "warning",
            "message": "ffmpeg not found. Audio quality may be reduced.",
        })
    else:
        logger.info("ffmpeg found: %s", ffmpeg_cmd)

    full_transcript = []

    try:
        while True:
            # Receive audio chunk from browser
            data = await websocket.receive_bytes()

            if not data or len(data) < 100:
                # Too small to be real audio — skip
                continue

            webm_path = None
            wav_path = None

            try:
                # Write WebM chunk to temp file
                with tempfile.NamedTemporaryFile(suffix=".webm", delete=False) as tmp:
                    tmp.write(data)
                    webm_path = tmp.name

                # Convert to WAV if ffmpeg available (Whisper works best with WAV)
                if ffmpeg_cmd:
                    wav_path = webm_path.replace(".webm", ".wav")
                    success = _convert_webm_to_wav(ffmpeg_cmd, webm_path, wav_path)
                    audio_path = wav_path if success else webm_path
                else:
                    audio_path = webm_path

                # Transcribe
                result = WhisperService._model.transcribe(
                    audio_path,
                    task="transcribe",
                    fp16=False,
                    condition_on_previous_text=True,
                )

                text = result.get("text", "").strip()
                language = result.get("language", "unknown")

                if text:
                    full_transcript.append(text)
                    logger.info("Partial transcript [%s]: %s", language, text[:80])

                    # Stream partial result back to browser immediately
                    await websocket.send_json({
                        "type": "partial",
                        "text": text,
                        "language": language,
                        "full": " ".join(full_transcript),
                    })

            except Exception as exc:
                logger.error("Chunk transcription error: %s", exc)
                await websocket.send_json({
                    "type": "error",
                    "message": f"Transcription error: {exc}",
                })
            finally:
                # Always clean up temp files
                for path in [webm_path, wav_path]:
                    if path and os.path.exists(path):
                        try:
                            os.unlink(path)
                        except Exception:
                            pass

    except WebSocketDisconnect:
        logger.info("WebSocket disconnected. Segments: %d", len(full_transcript))
    except Exception as exc:
        logger.error("WebSocket session error: %s", exc)
        try:
            await websocket.send_json({"type": "error", "message": str(exc)})
        except Exception:
            pass
