import base64
import json
import re
import httpx
from typing import Optional
from app.core.config import settings
from app.core.logging import logger
from app.core.exceptions import WeatherAPIError

GEMINI_BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models"
GROQ_CHAT_URL = "https://api.groq.com/openai/v1/chat/completions"

# Fallback vision model on Groq, used only if Gemini fails.
# Groq's model catalog changes over time; if this starts 404ing too,
# check https://console.groq.com/docs/models for the current vision model ID.
GROQ_VISION_MODEL_DEFAULT = "meta-llama/llama-4-scout-17b-16e-instruct"

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


def _build_prompt(crop_type: Optional[str], county: str, notes: str, json_mode_hint: bool = False) -> str:
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
    if json_mode_hint:
        lines.append(
            "Respond with ONLY a single valid JSON object, no markdown fences, no "
            "commentary before or after, using exactly these keys: crop_identified "
            "(string), disease_detected (boolean), disease_name (string), "
            "confidence_score (number 0-1), severity (one of: none, mild, moderate, "
            "severe), urgency (one of: low, medium, high), affected_area_pct "
            "(number 0-100), symptoms (array of strings), likely_causes (array of "
            "strings), treatment_recommendations (array of strings), "
            "organic_remedies (array of strings), prevention_tips (array of "
            "strings)."
        )
    return "\n".join(lines)


def _extract_json(text: str) -> dict:
    """Pull a JSON object out of a model's text reply, tolerating stray
    markdown fences or commentary some non-Gemini models add despite
    instructions."""
    text = text.strip()
    if text.startswith("```"):
        text = re.sub(r"^```(json)?", "", text).strip()
        text = re.sub(r"```$", "", text).strip()
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        match = re.search(r"\{.*\}", text, re.DOTALL)
        if match:
            return json.loads(match.group(0))
        raise


async def _analyze_with_gemini(
    image_b64: str,
    content_type: str,
    prompt: str,
) -> dict:
    if not settings.GEMINI_API_KEY:
        raise WeatherAPIError(message="GEMINI_API_KEY is not configured", status_code=500)

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
        response = await client.post(
            url,
            headers={
                "x-goog-api-key": settings.GEMINI_API_KEY,
                "Content-Type": "application/json",
            },
            json=payload,
        )
        response.raise_for_status()

    data = response.json()
    text = data["candidates"][0]["content"]["parts"][0]["text"]
    return json.loads(text)


async def _analyze_with_groq(
    image_b64: str,
    content_type: str,
    prompt: str,
) -> dict:
    if not settings.GROQ_API_KEY:
        raise WeatherAPIError(message="GROQ_API_KEY is not configured", status_code=500)

    groq_model = getattr(settings, "GROQ_VISION_MODEL", None) or GROQ_VISION_MODEL_DEFAULT
    data_uri = f"data:{content_type};base64,{image_b64}"

    payload = {
        "model": groq_model,
        "messages": [
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": prompt},
                    {"type": "image_url", "image_url": {"url": data_uri}},
                ],
            }
        ],
        "temperature": 0.2,
        "max_tokens": 1500,
    }

    async with httpx.AsyncClient(timeout=60.0) as client:
        response = await client.post(
            GROQ_CHAT_URL,
            headers={
                "Authorization": f"Bearer {settings.GROQ_API_KEY}",
                "Content-Type": "application/json",
            },
            json=payload,
        )
        response.raise_for_status()

    data = response.json()
    text = data["choices"][0]["message"]["content"]
    return _extract_json(text)


async def analyze_disease(
    image_bytes: bytes,
    filename: str,
    content_type: str,
    crop_type: Optional[str] = None,
    county: str = "Nyeri",
    notes: str = "",
) -> dict:
    image_b64 = base64.b64encode(image_bytes).decode("utf-8")

    result = None
    provider_used = None

    # --- Try Gemini first ---
    try:
        gemini_prompt = _build_prompt(crop_type, county, notes, json_mode_hint=False)
        logger.info(
            f"POST {GEMINI_BASE_URL}/{settings.GEMINI_MODEL}:generateContent | "
            f"image={filename} crop={crop_type} county={county}"
        )
        result = await _analyze_with_gemini(image_b64, content_type, gemini_prompt)
        provider_used = "gemini"
    except Exception as e:
        logger.warning(f"Gemini disease analysis failed, falling back to Groq: {e}")

    # --- Fall back to Groq if Gemini failed ---
    if result is None:
        try:
            groq_prompt = _build_prompt(crop_type, county, notes, json_mode_hint=True)
            groq_model = getattr(settings, "GROQ_VISION_MODEL", None) or GROQ_VISION_MODEL_DEFAULT
            logger.info(
                f"POST {GROQ_CHAT_URL} model={groq_model} | "
                f"image={filename} crop={crop_type} county={county}"
            )
            result = await _analyze_with_groq(image_b64, content_type, groq_prompt)
            provider_used = "groq"
        except Exception as e:
            logger.error(f"Groq disease analysis also failed: {e}")
            raise WeatherAPIError(
                message=(
                    "Both Gemini and Groq failed to analyze this image. "
                    f"Last error: {e}"
                ),
                status_code=502,
            )

    result.setdefault("original_image_url", None)
    logger.info(f"Disease analysis completed via {provider_used}")
    return result
