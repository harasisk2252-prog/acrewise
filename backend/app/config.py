from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    database_url: str = 'sqlite:///./acrewise.db'
    cors_origins: str = 'http://localhost:5173,http://127.0.0.1:5173'
    gemini_api_key: str = ''
    gemini_model: str = ''
    model_config = SettingsConfigDict(env_file='.env', extra='ignore')

settings = Settings()
