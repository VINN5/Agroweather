from fastapi import APIRouter, Query
from app.services.weather import get_current_weather, get_forecast, get_location_by_ip
from app.schemas.weather import ApiResponse, LocationResponse

router = APIRouter(prefix="/weather", tags=["Weather"])

@router.get("/current", response_model=ApiResponse)
async def current_weather(
    location: str = Query("Nyeri", description="City name (e.g. Mombasa, Nairobi) or coordinates (lat,lon)"),
    lang: str = Query("en", description="Language: en or sw")
):
    """Get current weather for any location"""
    data = await get_current_weather(location=location, lang=lang)
    return {"data": data}


@router.get("/forecast", response_model=ApiResponse)
async def forecast_weather(
    location: str = Query("Nyeri", description="City name or coordinates (lat,lon)"),
    days: int = Query(7, ge=1, le=14),
    lang: str = Query("en", description="Language: en or sw")
):
    """Get 7-day forecast for any location"""
    data = await get_forecast(location=location, days=days, lang=lang)
    return {"data": data}


@router.get("/location", response_model=LocationResponse)
async def detect_location():
    """Auto-detect location using IP"""
    data = await get_location_by_ip()
    return data