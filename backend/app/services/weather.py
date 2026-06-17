from app.services.http_client import get

async def get_current_weather(location: str = "Nyeri", lang: str = "en") -> dict:
    """Get current weather using WeatherAPI.com"""
    return await get("/current.json", params={
        "q": location,
        "aqi": "no",
        "alerts": "no",
        "lang": lang
    })


async def get_forecast(location: str = "Nyeri", days: int = 7, lang: str = "en") -> dict:
    """Get forecast using WeatherAPI.com"""
    return await get("/forecast.json", params={
        "q": location,
        "days": days,
        "aqi": "no",
        "alerts": "no",
        "lang": lang
    })


async def get_location_by_ip() -> dict:
    """Auto-detect location using IP"""
    return await get("/ip.json", params={
        "q": "auto:ip"
    })