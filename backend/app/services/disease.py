import base64
import json
import httpx
from typing import Optional
from app.core.config import settings
from app.core.logging import logger
from app.core.exceptions import WeatherAPIError

GEMINI_BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models"

RESPONSE_SCHEMA = {
    "type": "OBJECT",
    "properties": {
        "crop_identified": {"type": "STRING"},
        "disease_detected": {"type": "BOOLEAN"},
        "disease_name": {"type": "STRING"},
        "confidence_score": {"type": "NUMBER"},
        "severity": {"type": "STRING", "enum": ["none", "mild", "moderate", "severe"]},
        "urgency": {"type": "STRING", "enum": ["low", "medium", "high"]},
        "affected_area_pct": {"type": "NUMBER"},
        "symptoms": {"type": "ARRAY", "items": {"type": "STRING"}},
        "likely_causes": {"type": "ARRAY", "items": {"type": "STRING"}},
        "treatment_recommendations": {"type": "ARRAY", "items": {"type": "STRING"}},
        "organic_remedies": {"type": "ARRAY", "items": {"type": "STRING"}},
        "prevention_tips": {"type": "ARRAY", "items": {"type": "STRING"}},
    },
    "required": [
        "crop_identified",
        "disease_detected",
        "confidence_score",
        "severity",
        "urgency",
        "symptoms",
        "treatment_recommendations",
        "prevention_tips",
    ],
}


def _build_prompt(crop_type: Optional[str], county: str, notes: str) -> str:
    lines = [
        f"You are a plant pathologist and agricultural extension officer analyzing a "
        f"crop/leaf image from a smallholder farm in {county} County, Kenya."
    ]
    if crop_type:
        lines.append(f"The farmer says the crop is: {crop_type}.")
    if notes:
        lines.append(f"Farmer notes: {notes}")
    lines.append(
        "Identify the crop if possible. Determine whether the plant shows signs of "
        "disease, pest damage, or nutrient deficiency (disease_detected: true/false). "
        "If something is detected, name the most likely disease or issue, estimate "
        "affected_area_pct (0-100), and classify severity (none, mild, moderate, "
        "severe) and urgency (low, medium, high) for how quickly the farmer should act. "
        "List 2-5 observed symptoms and 1-3 likely causes (e.g. fungal, bacterial, "
        "viral, pest, nutrient deficiency, environmental stress). "
        "Give 2-4 practical treatment_recommendations a smallholder farmer in rural "
        "Kenya can realistically follow, including specific fungicide/pesticide "
        "classes where relevant. Also give 1-3 organic_remedies using low-cost, "
        "locally available materials (e.g. neem extract, wood ash, soap spray) as an "
        "affordable first line of defense. Give 2-4 prevention_tips to avoid "
        "recurrence next season (crop rotation, spacing, drainage, resistant "
        "varieties, sanitation). Be honest about uncertainty in confidence_score "
        "(0 to 1) — if the image is unclear or the plant looks healthy, say so "
        "rather than guessing a disease."
    )
    return "\n".join(lines)


async def analyze_disease(
    image_bytes: bytes,
    filename: str,
    content_type: str,
    crop_type: Optional[str] = None,
    county: str = "Nyeri",
    notes: str = "",
) -> dict:
    if not settings.GEMINI_API_KEY:
        raise WeatherAPIError(message="GEMINI_API_KEY is not configured", status_code=500)

    image_b64 = base64.b64encode(image_bytes).decode("utf-8")
    prompt = _build_prompt(crop_type, county, notes)

    payload = {
        "contents": [{
            "parts": [
                {"text": prompt},
                {"inline_data": {"mime_type": content_type, "data": image_b64}},
            ]
        }],
        "generationConfig": {
            "responseMimeType": "application/json",
            "responseSchema": RESPONSE_SCHEMA,
            "temperature": 0.2,
        },
    }

    url = f"{GEMINI_BASE_URL}/{settings.GEMINI_MODEL}:generateContent"

    async with httpx.AsyncClient(timeout=60.0) as client:
        logger.info(f"POST {url} | image={filename} crop={crop_type} county={county}")
        try:
            response = await client.post(
                url,
                headers={
                    "x-goog-api-key": settings.GEMINI_API_KEY,
                    "Content-Type": "application/json",
                },
                json=payload,
            )
            response.raise_for_status()
        except httpx.HTTPStatusError as e:
            raise WeatherAPIError(
                message=f"Gemini API error: {e.response.text}",
                status_code=e.response.status_code,
            )
        except Exception as e:
            raise WeatherAPIError(message=str(e))

    data = response.json()
    try:
        text = data["candidates"][0]["content"]["parts"][0]["text"]
        result = json.loads(text)
    except (KeyError, IndexError, json.JSONDecodeError):
        logger.error(f"Unexpected Gemini response shape: {data}")
        raise WeatherAPIError(message="Could not parse Gemini response", status_code=502)

    result.setdefault("original_image_url", None)
    return result
