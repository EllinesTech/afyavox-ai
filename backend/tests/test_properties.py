"""
Property-based tests for AfyaVox AI Phase 1.
Feature: afyavox-ai-phase1
"""
import os
import tempfile
import pytest
from hypothesis import given, settings as h_settings, HealthCheck
from hypothesis import strategies as st
from unittest.mock import patch, MagicMock

# ── Property 1: File size enforcement ────────────────────────────
# Feature: afyavox-ai-phase1, Property 1: File size enforcement
# Validates: Requirements 2.5, 2.6

@given(st.integers(min_value=100 * 1024 * 1024 + 1, max_value=150 * 1024 * 1024))
@h_settings(max_examples=20, suppress_health_check=[HealthCheck.too_slow])
def test_file_size_over_limit_rejected(file_size):
    """Files over 100MB must always return 413."""
    import asyncio
    from httpx import AsyncClient, ASGITransport
    from app.main import app

    async def run():
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            response = await client.post(
                "/api/transcribe",
                files={"audio": ("big.webm", b"x" * 100, "audio/webm")},
                headers={"content-length": str(file_size)}
            )
        assert response.status_code == 413

    asyncio.get_event_loop().run_until_complete(run())


# ── Property 8: Temp file cleanup ────────────────────────────────
# Feature: afyavox-ai-phase1, Property 8: Temp file cleanup after transcription
# Validates: Requirements 12.2

@given(st.binary(min_size=1, max_size=1000))
@h_settings(max_examples=20, suppress_health_check=[HealthCheck.too_slow])
def test_temp_file_always_cleaned_up(audio_bytes):
    """No .webm temp files should remain after transcription, success or failure."""
    import asyncio
    from app.services.whisper import WhisperService

    mock_model = MagicMock()
    mock_model.transcribe.return_value = {"text": "test", "language": "en"}

    tmp_dir = tempfile.gettempdir()
    before = set(f for f in os.listdir(tmp_dir) if f.endswith(".webm"))

    async def run():
        with patch.object(WhisperService, '_model', mock_model):
            service = WhisperService()
            try:
                await service.transcribe(audio_bytes)
            except Exception:
                pass  # errors are fine — we just check cleanup

    asyncio.get_event_loop().run_until_complete(run())

    after = set(f for f in os.listdir(tmp_dir) if f.endswith(".webm"))
    new_files = after - before
    assert len(new_files) == 0, f"Temp files not cleaned up: {new_files}"
