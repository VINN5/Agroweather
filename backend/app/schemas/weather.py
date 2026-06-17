from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime


class Condition(BaseModel):
    text: str
    icon: Optional[str] = None
    code: Optional[int] = None


class CurrentWeather(BaseModel):
    temp_c: float = Field(..., alias="temp_c")
    feelslike_c: float = Field(..., alias="feelslike_c")
    humidity: int
    wind_kph: float
    wind_dir: Optional[str] = None
    pressure_mb: Optional[float] = None
    vis_km: Optional[float] = None
    condition: Condition
    last_updated: Optional[str] = None


class ForecastDay(BaseModel):
    date: str
    day: Dict[str, Any]  # Contains maxtemp_c, mintemp_c, condition, etc.


class Forecast(BaseModel):
    forecastday: List[ForecastDay]


class WeatherResponse(BaseModel):
    """Main response from /current.json and /forecast.json"""
    location: Dict[str, Any]
    current: CurrentWeather
    forecast: Optional[Forecast] = None


class LocationResponse(BaseModel):
    """For /ip.json or location data"""
    city: str = Field(..., alias="name")
    region: Optional[str] = None
    country: str
    lat: float
    lon: float



class TreeAnalysisResponse(BaseModel):
    tree_count: int = Field(..., alias="treeCount")
    canopy_coverage: float = Field(..., alias="canopyCoverage")
    health_score: float = Field(..., alias="healthScore")
    recommendations: List[str]
    ai_insights: Optional[str] = Field(None, alias="aiInsights")
    image_url: Optional[str] = None


class ApiResponse(BaseModel):
    data: Dict[str, Any]
    message: Optional[str] = None