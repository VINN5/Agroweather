from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List

class Settings(BaseSettings):
    WEATHER_API_KEY: str
    WEATHER_API_BASE_URL: str = "http://api.weatherapi.com/v1"

    # Keep Groq for AI advice
    GROQ_API_KEY: str = ""

    APP_NAME: str = "AgroWeather Nyeri"
    APP_ENV: str = "development"          
    DEBUG: bool = True                  

    HOST: str = "0.0.0.0"
    PORT: int = 8000

    CORS_ORIGINS: List[str] = ["*"]

    model_config = SettingsConfigDict(
        env_file=".env",                    
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )

settings = Settings()