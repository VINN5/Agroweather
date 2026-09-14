from fastapi import APIRouter, UploadFile, File, Form
from typing import Optional
from app.services.disease import analyze_disease
from app.schemas.disease import DiseaseAnalysisResponse

router = APIRouter(prefix="/disease", tags=["Crop Disease Detection"])


@router.post("/analyze", response_model=DiseaseAnalysisResponse)
async def analyze_disease_endpoint(
    image: UploadFile = File(...),
    crop_type: Optional[str] = Form(None),
    county: str = Form("Nyeri"),
    notes: str = Form(""),
):
    """Upload a crop/leaf photo for AI-powered disease detection via Gemini"""
    image_bytes = await image.read()

    result = await analyze_disease(
        image_bytes=image_bytes,
        filename=image.filename or "crop_image.jpg",
        content_type=image.content_type or "image/jpeg",
        crop_type=crop_type,
        county=county,
        notes=notes,
    )

    return result
