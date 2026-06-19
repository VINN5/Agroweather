from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from app.core.config import settings
from app.core.logging import logger, setup_logging
from app.api.v1.endpoints.crops import router as crops_router

# Exception handlers
from app.core.exceptions import (
    weather_exception_handler,
    validation_exception_handler,
    general_exception_handler,
    WeatherAPIError
)

# Routers
from app.api.v1.router import api_router

setup_logging()

app = FastAPI(
    title=settings.APP_NAME,
    description="AgroWeather Dashboard API for Central Kenya farmers. Features: Weather, 7-day forecast, AI farming advice, Tree canopy analysis.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Exception Handlers
app.add_exception_handler(WeatherAPIError, weather_exception_handler)
app.add_exception_handler(RequestValidationError, validation_exception_handler)
app.add_exception_handler(Exception, general_exception_handler)

# Include API router
app.include_router(api_router, prefix="/api/v1")
app.include_router(crops_router)

@app.on_event("startup")
async def on_startup():
    logger.info(f"{settings.APP_NAME} starting — Environment: {settings.APP_ENV}")

@app.get("/", tags=["Health"])
async def root():
    return {
        "message": "Welcome to AgroWeather Nyeri API 🌧️🌱",
        "docs": "/docs",
        "default_location": "Nyeri, Kenya"
    }

@app.get("/health", tags=["Health"])
async def health_check():
    return {"status": "healthy", "env": settings.APP_ENV}
