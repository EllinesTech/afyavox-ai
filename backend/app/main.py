from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: load Whisper model once into memory
    from app.services.whisper import WhisperService
    WhisperService.load_model(settings.whisper_model)
    yield
    # Shutdown: nothing to clean up for now


app = FastAPI(
    title=settings.app_name,
    version=settings.version,
    description="Voice-powered clinical documentation assistant",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_origin],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health", tags=["system"])
def health_check():
    return {"status": "ok", "version": settings.version}


# ── Routers ──────────────────────────────────────────────────────
from app.api.transcribe import router as transcribe_router  # noqa: E402
app.include_router(transcribe_router)

# Phase 3: from app.api.notes import router as notes_router
# Phase 5: from app.api.ws_transcribe import router as ws_router
