from fastapi import APIRouter, UploadFile, File, Form
from typing import Optional
from app.services.trees import analyze_canopy
from app.schemas.trees import TreeAnalysisResponse
from app.schemas.weather import ApiResponse

router = APIRouter(prefix="/trees", tags=["Tree Analysis"])

@router.post("/analyze", response_model=ApiResponse)
async def analyze_tree_canopy(
    image: UploadFile = File(...),
    county: str = Form("Nyeri"),
    land_acres: Optional[float] = Form(None),
    notes: str = Form(""),
):
    """Upload farm image for tree canopy analysis"""
    image_bytes = await image.read()
    
    result = await analyze_canopy(
        image_bytes=image_bytes,
        filename=image.filename or "farm_image.jpg",
        content_type=image.content_type or "image/jpeg",
        county=county,
        land_acres=land_acres,
        notes=notes
    )
    return {"data": result}
