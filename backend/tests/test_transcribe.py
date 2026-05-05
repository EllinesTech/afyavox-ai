import pytest
from httpx import AsyncClient, ASGITransport
from unittest.mock import patch, MagicMock
from app.main import app
from app.core.config import Settings

@pytest.fixture
def mock_whisper_model():
    """Mock the Whisper model so tests don't need the actual model loaded."""
    mock_model = MagicMock()
    mock_model.transcribe.return_value = {
        "text": "Patient has a headache.",
        "language": "en"
    }
    return mock_model

@pytest.mark.asyncio
async def test_health_endpoint_returns_ok():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"

@pytest.mark.asyncio
async def test_cors_headers_present():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.options(
            "/api/transcribe",
            headers={"Origin": "http://localhost:5173", "Access-Control-Request-Method": "POST"}
        )
    assert "access-control-allow-origin" in response.headers

@pytest.mark.asyncio
async def test_corrupt_audio_returns_422(mock_whisper_model):
    from app.services.whisper import WhisperService
    with patch.object(WhisperService, '_model', mock_whisper_model):
        mock_whisper_model.transcribe.side_effect = Exception("Invalid audio format")
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            response = await client.post(
                "/api/transcribe",
                files={"audio": ("test.webm", b"corrupt_bytes", "audio/webm")}
            )
    assert response.status_code == 422

@pytest.mark.asyncio
async def test_file_too_large_returns_413():
    # Send Content-Length header indicating oversized file
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.post(
            "/api/transcribe",
            files={"audio": ("big.webm", b"x" * 100, "audio/webm")},
            headers={"content-length": str(200 * 1024 * 1024)}  # 200MB
        )
    assert response.status_code == 413

@pytest.mark.asyncio
async def test_successful_transcription_returns_correct_schema(mock_whisper_model):
    from app.services.whisper import WhisperService
    with patch.object(WhisperService, '_model', mock_whisper_model):
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            response = await client.post(
                "/api/transcribe",
                files={"audio": ("test.webm", b"fake_audio_bytes", "audio/webm")}
            )
    assert response.status_code == 200
    data = response.json()
    assert "transcript" in data
    assert "language" in data
    assert "status" in data
    assert isinstance(data["transcript"], str)
    assert isinstance(data["language"], str)
    assert isinstance(data["status"], str)

def test_settings_loaded_from_env(monkeypatch):
    monkeypatch.setenv("WHISPER_MODEL", "small")
    s = Settings()
    assert s.whisper_model == "small"
