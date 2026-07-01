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


def _build_prompt(county: str, land_acres: Optional[float], notes: str) -> str:
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
    return "\n".join(lines)


async def analyze_canopy(
    image_bytes: bytes,
    filename: str,
    content_type: str,
    county: str = "Nyeri",
    land_acres: Optional[float] = None,
    notes: str = "",
) -> dict:
    if not settings.GEMINI_API_KEY:
        raise WeatherAPIError(message="GEMINI_API_KEY is not configured", status_code=500)

    image_b64 = base64.b64encode(image_bytes).decode("utf-8")
    prompt = _build_prompt(county, land_acres, notes)

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
        logger.info(f"POST {url} | image={filename} county={county}")
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
    result.setdefault("overlay_image_url", None)
    return result