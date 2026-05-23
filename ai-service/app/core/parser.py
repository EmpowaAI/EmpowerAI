import json
import re

from app.core.exceptions import AIServiceError


def extract_json(raw: str) -> dict:
    """
    Safely extracts a JSON object from an AI response.

    Handles:
    - Markdown code blocks
    - Extra text before/after JSON
    - Partial model formatting issues
    """

    if not raw or not isinstance(raw, str):
        raise AIServiceError(
            message="AI returned empty or invalid response.",
            status_code=500,
        )

    # Remove markdown code fences (```json ... ```)
    cleaned = re.sub(r"```(?:json)?", "", raw)
    cleaned = cleaned.replace("```", "").strip()

    # First attempt: direct JSON parse
    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        pass

    # Second attempt: extract first valid JSON object
    match = re.search(r"\{.*\}", cleaned, re.DOTALL)
    if match:
        try:
            return json.loads(match.group())
        except json.JSONDecodeError:
            pass

    # Final failure
    raise AIServiceError(
        message="AI returned malformed JSON. Could not parse response.",
        status_code=500,
        details={
            "raw_response": raw[:1000]  # prevent huge logs
        },
    )