from fastapi import APIRouter
from pydantic import BaseModel
from groq import Groq
from app.core.config import settings
from app.core.logging import logger

router = APIRouter(prefix="/crops", tags=["Crops"])


class CropSuggestionRequest(BaseModel):
    location: str


class CropSuggestionResponse(BaseModel):
    crops: list[str]
    location: str


@router.post("/suggest", response_model=CropSuggestionResponse)
async def suggest_crops(request: CropSuggestionRequest):
    logger.info(f"Generating crop suggestions for: {request.location}")

    prompt = f"""You are an expert in Kenyan agriculture.
List the top 5 most commonly grown crops in **{request.location}**, Kenya.
Return only a JSON list of crop names (lowercase).
Example: ["tea", "coffee", "maize", "banana", "potato"]

Do not add any extra text."""

    try:
        client = Groq(api_key=settings.GROQ_API_KEY)
        completion = client.chat.completions.create(
            messages=[{"role": "user", "content": prompt}],
            model="llama-3.3-70b-versatile",
            temperature=0.3,
            max_tokens=150,
        )

        # Extract JSON list from response
        content = completion.choices[0].message.content.strip()
        import json
        crops = json.loads(content)

        return CropSuggestionResponse(
            crops=crops[:6],  # Limit to 6 crops
            location=request.location
        )

    except Exception as e:
        logger.error(f"Error suggesting crops: {e}")
        # Fallback
        return CropSuggestionResponse(
            crops=["maize", "horticulture", "general"],
            location=request.location
        )