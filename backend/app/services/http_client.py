import httpx
from app.core.config import settings
from app.core.logging import logger
from app.core.exceptions import WeatherAPIError

def get_headers() -> dict:
    """WeatherAPI.com does not use Authorization header"""
    return {
        "Content-Type": "application/json",
    }

async def get(endpoint: str, params: dict = None) -> dict:
    if params is None:
        params = {}
    
    # Add API key to every request
    params["key"] = settings.WEATHER_API_KEY
    
    url = f"{settings.WEATHER_API_BASE_URL}{endpoint}"
    
    async with httpx.AsyncClient(timeout=15.0) as client:
        logger.info(f"GET {url} | params: {params}")
        try:
            response = await client.get(url, headers=get_headers(), params=params)
            response.raise_for_status()
            return response.json()
        except httpx.HTTPStatusError as e:
            raise WeatherAPIError(
                message=f"WeatherAPI error: {e.response.text}",
                status_code=e.response.status_code
            )
        except Exception as e:
            raise WeatherAPIError(message=str(e))

async def post_multipart(endpoint: str, files: dict, data: dict = None) -> dict:
    """Keep for Tree Canopy Scanner (if still using WeatherAI for this)"""
    if data is None:
        data = {}
    url = f"{settings.WEATHER_AI_BASE_URL}{endpoint}"   # Keep old base for tree analysis if needed
    
    headers = {"Authorization": f"Bearer {settings.WEATHER_AI_API_KEY}"}
    
    async with httpx.AsyncClient(timeout=60.0) as client:
        logger.info(f"POST {url} | multipart with fields: {list(data.keys())}")
        try:
            response = await client.post(url, headers=headers, files=files, data=data)
            response.raise_for_status()
            return response.json()
        except httpx.HTTPStatusError as e:
            raise WeatherAPIError(
                message=f"Weather-AI API error: {e.response.text}",
                status_code=e.response.status_code
            )
        except Exception as e:
            raise WeatherAPIError(message=str(e))