from fastapi import APIRouter
from pydantic import BaseModel
from groq import Groq
from app.core.config import settings
from app.core.logging import logger

router = APIRouter(prefix="/advice", tags=["Farming Advice"])


class AdviceRequest(BaseModel):
    temperature: float
    humidity: int
    wind_speed: float
    condition: str
    crop_type: str = "general"
    lang: str = "en"


class AdviceResponse(BaseModel):
    advice: str
    crop_type: str
    lang: str


@router.post("/", response_model=AdviceResponse)
async def get_farming_advice(request: AdviceRequest) -> AdviceResponse:
    logger.info(f"Generating farming advice for crop={request.crop_type}, lang={request.lang}")

    lang_instruction = "Respond in Swahili." if request.lang == "sw" else "Respond in English."

    prompt = f"""You are an expert agricultural advisor for Central Kenya (Nyeri County).
A farmer has the following current weather conditions:
- Temperature: {request.temperature}°C
- Humidity: {request.humidity}%
- Wind Speed: {request.wind_speed} km/h
- Condition: {request.condition}
- Crop Type: {request.crop_type}

{lang_instruction}

Give 3-4 specific, practical farming recommendations for today based on these conditions.
Keep it concise, actionable, and relevant to smallholder farmers in Nyeri.
Focus on: irrigation, harvesting timing, pest/disease risk, and field activities."""

    client = Groq(api_key=settings.GROQ_API_KEY)

    chat_completion = client.chat.completions.create(
    messages=[{"role": "user", "content": prompt}],
    model="llama-3.3-70b-versatile",
)
    advice = chat_completion.choices[0].message.content

    return AdviceResponse(
        advice=advice,
        crop_type=request.crop_type,
        lang=request.lang,
    )