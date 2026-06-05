from app.services.http_client import get

async def get_current_weather(lat: float = -0.42, lon: float = 36.95, lang: str = "en") -> dict:
    """Get current weather + AI summary for Nyeri by default"""
    return await get("/v1/current", params={
        "lat": lat,
        "lon": lon,
        "units": "metric",
        "lang": lang,
        "ai": True,
    })

async def get_forecast(lat: float = -0.42, lon: float = 36.95, days: int = 7, lang: str = "en") -> dict:
    """Get forecast with AI advice"""
    return await get("/v1/weather", params={
        "lat": lat,
        "lon": lon,
        "days": days,
        "units": "metric",
        "lang": lang,
        "ai": True,
    })

async def get_location_by_ip() -> dict:
    """Auto-detect location"""
    return await get("/v1/weather-geo", params={"ip": "auto", "ai": False})
