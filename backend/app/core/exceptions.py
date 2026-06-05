from fastapi import Request, status
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from pydantic import ValidationError
import httpx
from app.core.config import settings

class WeatherAPIError(Exception):
    """Custom exception for Weather-AI API failures"""
    def __init__(self, message: str, status_code: int = 502):
        self.message = message
        self.status_code = status_code

async def weather_exception_handler(request: Request, exc: WeatherAPIError):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": "WeatherAPIError",
            "message": exc.message,
            "detail": "Failed to fetch data from Weather-AI service"
        }
    )

async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "error": "ValidationError",
            "message": "Invalid input data",
            "detail": exc.errors()
        }
    )

async def general_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": "InternalServerError",
            "message": "An unexpected error occurred",
            "detail": str(exc) if settings.DEBUG else "Please try again later"
        }
    )
