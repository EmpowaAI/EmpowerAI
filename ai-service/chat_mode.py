"""
Helpers for selecting Digital Twin chat mode.
"""

from typing import Any, Dict, Optional


def has_loaded_twin_context(cv_context: Optional[Dict[str, Any]]) -> bool:
    """
    Determine whether chat should run in advisor mode (loaded twin)
    or guided quiz mode (profile building).

    Preferred contract:
    - source=twin => advisor mode
    - source=cv|quiz => guided quiz mode

    Fallback:
    - Legacy heuristic for older clients that do not send `source`.
    """
    context = cv_context or {}
    source = context.get("source")

    if source == "twin":
        return True
    if source in ["cv", "quiz"]:
        return False

    return bool(
        (context.get("currentRole") and context.get("currentRole") not in ["", "UNDEFINED"])
        or (context.get("industry") and context.get("industry") not in ["", "Technology"])
        or (context.get("skills") and len(context.get("skills")) > 0)
        or (
            context.get("sections")
            and (
                (context["sections"].get("skills") and len(context["sections"]["skills"]) > 0)
                or (context["sections"].get("experience") and len(context["sections"]["experience"]) > 0)
            )
        )
    )
