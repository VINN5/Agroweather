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
# Confirmed via GET https://api.groq.com/openai/v1/models that this is
# currently the only model with "image" in input_modalities. If it starts
# 404ing later, re-check that endpoint for whichever model replaces it.
GROQ_VISION_MODEL_DEFAULT = "qwen/qwen3.8-27b"

RESPONSE_SCHEMA = {
    "type": "OBJECT",
    "properties": {
        "total_tree_count": {"type": "INTEGER"},
        "canopy_coverage_pct": {"type": "NUMBER"},
        "confidence_score": {"type": "NUMBER"},
        "tree_density_per_acre": {"type": "NUMBER"},
        "tree_species_guess": {"type": "STRING"},
        "tree_health": {
            "type": "OBJECT",
            "properties": {
                "healthy": {"type": "INTEGER"},
                "needs_care": {"type": "INTEGER"},
                "needs_replacement": {"type": "INTEGER"},
            },
            "required": ["healthy", "needs_care", "needs_replacement"],
        },
        "observations": {"type": "ARRAY", "items": {"type": "STRING"}},
        "recommendations": {"type": "ARRAY", "items": {"type": "STRING"}},
    },
    "required": [
        "total_tree_count",
        "canopy_coverage_pct",
        "confidence_score",
        "tree_health",
        "observations",
        "recommendations",
    ],
}


def _build_prompt(county: str, land_acres: Optional[float], notes: str, json_mode_hint: bool = False) -> str:
    lines = [
        f"You are an agroforestry expert analyzing a farm image from {county} County, Kenya."
    ]
    if land_acres:
        lines.append(f"The land parcel is approximately {land_acres} acres.")
    if notes:
        lines.append(f"Farmer notes: {notes}")
    lines.append(
        "Count the visible trees, estimate canopy coverage percentage, guess the "
        "dominant tree species if identifiable, and classify each visible tree as "
        "healthy, needs_care, or needs_replacement. Estimate tree density per acre "
        "if land size is known. Give 2-4 concise observations and 2-4 actionable "
        "recommendations for the farmer. Be honest about uncertainty in "
        "confidence_score (0 to 1)."
    )
    if json_mode_hint:
        lines.append(
            "Respond with ONLY a single valid JSON object, no markdown fences, no "
            "commentary before or after, using exactly these keys: "
            "total_tree_count (integer), canopy_coverage_pct (number 0-100), "
            "confidence_score (number 0-1), tree_density_per_acre (number, or "
            "null if land size unknown), tree_species_guess (string), "
            "tree_health (an object with integer keys healthy, needs_care, "
            "needs_replacement), observations (array of strings), "
            "recommendations (array of strings)."
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
        "response_format": {"type": "json_object"},
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


async def analyze_canopy(
    image_bytes: bytes,
    filename: str,
    content_type: str,
    county: str = "Nyeri",
    land_acres: Optional[float] = None,
    notes: str = "",
) -> dict:
    image_b64 = base64.b64encode(image_bytes).decode("utf-8")

    result = None
    provider_used = None

    # --- Try Gemini first ---
    try:
        gemini_prompt = _build_prompt(county, land_acres, notes, json_mode_hint=False)
        logger.info(
            f"POST {GEMINI_BASE_URL}/{settings.GEMINI_MODEL}:generateContent | "
            f"image={filename} county={county}"
        )
        result = await _analyze_with_gemini(image_b64, content_type, gemini_prompt)
        provider_used = "gemini"
    except Exception as e:
        logger.warning(f"Gemini canopy analysis failed, falling back to Groq: {e}")

    # --- Fall back to Groq if Gemini failed ---
    if result is None:
        try:
            groq_prompt = _build_prompt(county, land_acres, notes, json_mode_hint=True)
            groq_model = getattr(settings, "GROQ_VISION_MODEL", None) or GROQ_VISION_MODEL_DEFAULT
            logger.info(
                f"POST {GROQ_CHAT_URL} model={groq_model} | "
                f"image={filename} county={county}"
            )
            result = await _analyze_with_groq(image_b64, content_type, groq_prompt)
            provider_used = "groq"
        except Exception as e:
            logger.error(f"Groq canopy analysis also failed: {e}")
            raise WeatherAPIError(
                message=(
                    "Both Gemini and Groq failed to analyze this image. "
                    f"Last error: {e}"
                ),
                status_code=502,
            )

    result.setdefault("original_image_url", None)
    result.setdefault("overlay_image_url", None)
    logger.info(f"Canopy analysis completed via {provider_used}")
    return result
