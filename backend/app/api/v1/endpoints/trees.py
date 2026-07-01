from fastapi import APIRouter, UploadFile, File, Form
from typing import Optional
from app.services.trees import analyze_canopy
from app.schemas.trees import TreeAnalysisResponse

router = APIRouter(prefix="/trees", tags=["Tree Analysis"])


@router.post("/analyze", response_model=TreeAnalysisResponse)
async def analyze_canopy_endpoint(
    image: UploadFile = File(...),
    county: str = Form("Nyeri"),
    land_acres: Optional[float] = Form(None),
    notes: str = Form(""),
):
    """Upload farm image for tree canopy analysis via Gemini"""
    image_bytes = await image.read()

    result = await analyze_canopy(
        image_bytes=image_bytes,
        filename=image.filename or "farm_image.jpg",
        content_type=image.content_type or "image/jpeg",
        county=county,
        land_acres=land_acres,
        notes=notes,
    )

    return result