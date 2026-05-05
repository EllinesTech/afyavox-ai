from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    app_name: str = "Afyavox AI"
    openai_api_key: str = ""
    whisper_model: str = "base"
    llm_model: str = "gpt-4"

    class Config:
        env_file = ".env"

settings = Settings()
