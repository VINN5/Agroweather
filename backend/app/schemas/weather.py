from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime

# Base models for Weather-AI responses
class WeatherCondition(BaseModel):
    main: str
    description: str
    icon: Optional[str] = None

class CurrentWeather(BaseModel):
    temp: float
    feels_like: float
    humidity: int
    wind_speed: float
    wind_dir: Optional[int] = None
    pressure: Optional[int] = None
    visibility: Optional[int] = None
    condition: WeatherCondition
    ai_summary: Optional[str] = Field(None, alias="aiSummary")

class DailyForecast(BaseModel):
    date: str
    temp_max: float
    temp_min: float
    condition: WeatherCondition
    ai_advice: Optional[str] = Field(None, alias="aiAdvice")

class WeatherResponse(BaseModel):
    location: str
    current: CurrentWeather
    forecast: List[DailyForecast]
    timestamp: datetime

class LocationResponse(BaseModel):
    city: str
    county: str
    country: str = "Kenya"
    lat: float
    lon: float

# Tree Analysis Response
class TreeAnalysisResponse(BaseModel):
    tree_count: int = Field(..., alias="treeCount")
    canopy_coverage: float = Field(..., alias="canopyCoverage")
    health_score: float = Field(..., alias="healthScore")
    recommendations: List[str]
    ai_insights: Optional[str] = Field(None, alias="aiInsights")
    image_url: Optional[str] = None

# Generic fallback
class ApiResponse(BaseModel):
    data: Dict[str, Any]
    message: Optional[str] = None
