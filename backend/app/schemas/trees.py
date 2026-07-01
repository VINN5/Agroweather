from pydantic import BaseModel
from typing import Optional, List

class TreeHealth(BaseModel):
    healthy: int
    needs_care: int
    needs_replacement: int

class TreeAnalysisResponse(BaseModel):
    total_tree_count: Optional[int] = None
    canopy_coverage_pct: Optional[float] = None
    confidence_score: Optional[float] = None
    tree_density_per_acre: Optional[float] = None
    tree_species_guess: Optional[str] = None
    tree_health: Optional[TreeHealth] = None
    observations: Optional[List[str]] = None
    recommendations: Optional[List[str]] = None
    original_image_url: Optional[str] = None
    overlay_image_url: Optional[str] = None