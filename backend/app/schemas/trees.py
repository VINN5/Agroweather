from pydantic import BaseModel, Field
from typing import List, Optional

class TreeAnalysisResponse(BaseModel):
    tree_count: int = Field(..., alias="treeCount")
    canopy_coverage: float = Field(..., alias="canopyCoverage")
    health_score: float = Field(..., alias="healthScore")
    recommendations: List[str]
    ai_insights: Optional[str] = Field(None, alias="aiInsights")
    image_url: Optional[str] = None
