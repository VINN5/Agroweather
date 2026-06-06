from fastapi import APIRouter
from app.api.v1.endpoints.weather import router as weather_router
from app.api.v1.endpoints.trees import router as trees_router
from app.api.v1.endpoints.advice import router as advice_router

api_router = APIRouter()
api_router.include_router(weather_router)
api_router.include_router(trees_router)
api_router.include_router(advice_router)