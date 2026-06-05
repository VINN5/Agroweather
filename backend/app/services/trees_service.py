from app.services.http_client import post_multipart


async def analyze_canopy(
    image_bytes: bytes,
    filename: str,
    content_type: str,
    county: str = "Nyeri",
    land_acres: float | None = None,
    notes: str = "",
) -> dict:
    files = {
        "image": (filename, image_bytes, content_type),
    }
    data = {"county": county}
    if land_acres is not None:
        data["landAcres"] = str(land_acres)
    if notes:
        data["notes"] = notes

    return await post_multipart("/v1/trees/analyze", files=files, data=data)