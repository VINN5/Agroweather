from app.services.http_client import get


async def get_current_weather(lat: float, lon: float, lang: str = "en") -> dict:
    return await get("/v1/current", params={
        "lat": lat,
        "lon": lon,
        "units": "metric",
        "lang": lang,
        "ai": True,
    })


async def get_forecast(lat: float, lon: float, days: int = 7, lang: str = "en") -> dict:
    return await get("/v1/weather", params={
        "lat": lat,
        "lon": lon,
        "days": days,
        "units": "metric",
        "lang": lang,
        "ai": True,
    })


async def get_location_by_ip() -> dict:
    return await get("/v1/weather-geo", params={"ip": "auto", "ai": False})