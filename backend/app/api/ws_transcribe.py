"""
WebSocket /ws/transcribe — Real-time streaming transcription.

The doctor sees text appearing live as they speak.
Flow:
  1. Browser connects via WebSocket
  2. Browser sends audio chunks (binary) every 2 seconds while recording
  3. Server runs Whisper on each chunk and streams partial transcripts back
  4. Browser appends each partial to the live transcript panel
  5. On disconnect, final transcript is complete
"""
import logging
import os
import tempfile
from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from app.services.whisper import WhisperService

logger = logging.getLogger(__name__)
router = APIRouter(tags=["streaming"])

whisper_service = WhisperService()


@router.websocket("/ws/transcribe")
async def ws_transcribe(websocket: WebSocket):
    """
    Real-time streaming transcription via WebSocket.

    Protocol:
      Client → Server: binary audio chunks (WebM/Opus)
      Server → Client: JSON {"type": "partial", "text": "...", "language": "..."}
      Server → Client: JSON {"type": "done", "text": "...", "language": "..."}
      Server → Client: JSON {"type": "error", "message": "..."}
    """
    await websocket.accept()
    logger.info("WebSocket transcription session started")

    full_transcript = []

    try:
        while True:
            # Receive audio chunk from browser
            data = await websocket.receive_bytes()

            if not data:
                continue

            tmp_path = None
            try:
                # Write chunk to temp file
                with tempfile.NamedTemporaryFile(suffix=".webm", delete=False) as tmp:
                    tmp.write(data)
                    tmp_path = tmp.name

                # Transcribe the chunk
                result = WhisperService._model.transcribe(
                    tmp_path,
                    task="transcribe",
                    fp16=False,
                )

                text = result.get("text", "").strip()
                language = result.get("language", "unknown")

                if text:
                    full_transcript.append(text)
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
                    "message": str(exc),
                })
            finally:
                if tmp_path and os.path.exists(tmp_path):
                    os.unlink(tmp_path)

    except WebSocketDisconnect:
        logger.info("WebSocket disconnected. Full transcript: %d segments", len(full_transcript))
        # Session ended — nothing more to send
    except Exception as exc:
        logger.error("WebSocket error: %s", exc)
        try:
            await websocket.send_json({"type": "error", "message": str(exc)})
        except Exception:
            pass
