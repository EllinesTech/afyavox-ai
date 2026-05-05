from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "AfyaVox AI"
    version: str = "0.1.0"

    # Whisper (local — no API key required)
    # small = best balance of speed + accuracy for African languages (Kikuyu, Luo, Kisii, Swahili)
    # base  = faster but poor on low-resource languages
    # medium/large = most accurate but very slow on CPU
    whisper_model: str = "small"  # base | small | medium | large

    # Ollama local LLM (Phase 3)
    ollama_base_url: str = "http://localhost:11434"
    llm_model: str = "llama3"  # llama3 | mistral

    # NLLB translation (Phase 2) — supports 200+ languages
    # Input:  ANY language → English  (for AI processing)
    # Output: English → doctor's chosen language  (for note delivery)
    nllb_model: str = "facebook/nllb-200-distilled-600M"
    default_output_language: str = "en"  # doctor's preferred note output language

    # Server
    frontend_origin: str = "http://localhost:5173"
    max_upload_bytes: int = 100 * 1024 * 1024  # 100 MB

    # Database (Phase 3+)
    database_url: str = "postgresql://user:password@localhost:5432/afyavox"
    redis_url: str = "redis://localhost:6379"

    # Auth (Phase 3+)
    secret_key: str = "change-me-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 60

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


settings = Settings()
