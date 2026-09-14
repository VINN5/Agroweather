from pydantic import BaseModel
from typing import Optional, List


class DiseaseAnalysisResponse(BaseModel):
    crop_identified: Optional[str] = None
    disease_detected: Optional[bool] = None
    disease_name: Optional[str] = None
    confidence_score: Optional[float] = None
    severity: Optional[str] = None            # mild | moderate | severe
    urgency: Optional[str] = None              # low | medium | high
    affected_area_pct: Optional[float] = None
    symptoms: Optional[List[str]] = None
    likely_causes: Optional[List[str]] = None
    treatment_recommendations: Optional[List[str]] = None
    organic_remedies: Optional[List[str]] = None
    prevention_tips: Optional[List[str]] = None
    original_image_url: Optional[str] = None
