from fastapi import APIRouter
from pydantic import BaseModel
from groq import Groq, GroqError
from app.core.config import settings
from app.core.logging import logger

router = APIRouter(prefix="/advice", tags=["Farming Advice"])


class AdviceRequest(BaseModel):
    temperature: float
    humidity: int
    wind_speed: float
    condition: str
    crop_type: str = "general"      # Can be "general" or specific
    lang: str = "en"
    location: str = "Nyeri"


class AdviceResponse(BaseModel):
    advice: str
    crop_type: str
    lang: str
    location: str


@router.post("/", response_model=AdviceResponse)
async def get_farming_advice(request: AdviceRequest) -> AdviceResponse:
    logger.info(f"Generating advice → Location: {request.location} | Crop: {request.crop_type}")

    lang_instruction = "Respond in Swahili." if request.lang == "sw" else "Respond in English."

    prompt = f"""You are an expert agricultural extension officer in Kenya.

Location: **{request.location}**
Current weather: {request.temperature}°C, {request.humidity}% humidity, wind {request.wind_speed} km/h, {request.condition}

The user is interested in **{request.crop_type}**.

{lang_instruction}

Provide 3-4 practical farming recommendations for today.
- If the user selected "general", suggest the most suitable crops for {request.location} and give advice accordingly.
- Consider local climate, soil, and common farming practices in that specific region.
- Focus on irrigation, harvesting, pest/disease risks, and field activities.

Be specific to the region. For example:
- Nyeri / Kirinyaga → Tea, Coffee, Horticulture
- Mombasa / Coast → Coconut, Mango, Cashew, Cassava
- Kisumu / Western → Sugarcane, Maize, Fish farming
- Etc."""

    try:
        client = Groq(api_key=settings.GROQ_API_KEY)

        chat_completion = client.chat.completions.create(
            messages=[{"role": "user", "content": prompt}],
            model="llama-3.3-70b-versatile",
            temperature=0.7,
            max_tokens=700,
        )
        advice = chat_completion.choices[0].message.content.strip()

        return AdviceResponse(
            advice=advice,
            crop_type=request.crop_type,
            lang=request.lang,
            location=request.location,
        )

    except Exception as e:
        logger.error(f"Groq error: {e}")
        return AdviceResponse(
            advice="Sorry, I couldn't generate advice right now. Please try again.",
            crop_type=request.crop_type,
            lang=request.lang,
            location=request.location,
        )