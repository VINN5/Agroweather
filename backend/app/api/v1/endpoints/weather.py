from fastapi import APIRouter, Query
from app.services.weather import get_current_weather, get_forecast, get_location_by_ip
from app.schemas.weather import WeatherResponse, LocationResponse, ApiResponse

router = APIRouter(prefix="/weather", tags=["Weather"])

@router.get("/current", response_model=ApiResponse)
async def current_weather(
    lat: float = Query(-0.42, description="Latitude (default: Nyeri)"),
    lon: float = Query(36.95, description="Longitude (default: Nyeri)"),
    lang: str = Query("en", description="Language: en or sw")
):
    data = await get_current_weather(lat, lon, lang)
    return {"data": data}

@router.get("/forecast", response_model=ApiResponse)
async def forecast_weather(
    lat: float = Query(-0.42, description="Latitude"),
    lon: float = Query(36.95, description="Longitude"),
    days: int = Query(7, ge=1, le=14),
    lang: str = Query("en", description="Language: en or sw")
):
    data = await get_forecast(lat, lon, days, lang)
    return {"data": data}

@router.get("/location", response_model=LocationResponse)
async def detect_location():
    """Auto-detect location using IP"""
    data = await get_location_by_ip()
    return data
