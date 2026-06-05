from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List

class Settings(BaseSettings):
   
    WEATHER_AI_API_KEY: str
    WEATHER_AI_BASE_URL: str = "https://api.weather-ai.co"

    
    APP_NAME: str = "AgroWeather Nyeri"
    APP_ENV: str = "production"          
    DEBUG: bool = False                  

    HOST: str = "0.0.0.0"
    PORT: int = 8000

    
    CORS_ORIGINS: List[str] = ["*"]

    model_config = SettingsConfigDict(
        env_file=".env",                    
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
        
        secrets_dir="/etc/secrets",         
    )

settings = Settings()