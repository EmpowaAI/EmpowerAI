from app.core.aiClient import AIClient
from app.core.parser import extract_json
from app.core.exceptions import AIServiceError
from app.modules.cvRevamp.prompts import build_cv_revamp_prompt
from app.utils.logger import logger


class CVRevampService:

    SYSTEM_PROMPT = (
        "You are an elite CV writer and ATS optimization specialist. "
        "You rewrite CVs to be professional, keyword-rich, and compelling. "
        "You return only valid JSON — no markdown, no explanation, no preamble. "
        "You never fabricate experience, companies, or qualifications."
    )

    def __init__(self):
        self.client = AIClient()

    def revamp(self, payload: dict) -> dict:
        cv_text = payload.get("cv_text", "").strip()
        analysis = payload.get("analysis")
        target_role = payload.get("target_role", "").strip()
        industry = payload.get("industry", "").strip()

        self._validate(cv_text, analysis, target_role, industry)

        logger.info(
            "CV_REVAMP_START",
            extra={
                "role": target_role,
                "industry": industry,
                "cv_chars": len(cv_text),
            },
        )

        prompt = build_cv_revamp_prompt(
            cv_text=cv_text,
            analysis=analysis,
            target_role=target_role,
            industry=industry,
        )

        raw = self.client.complete(
            prompt=prompt,
            system=self.SYSTEM_PROMPT,
            max_tokens=6000,
        )
        result = extract_json(raw)

        # Validate the model actually returned a usable revamped CV — a
        # well-formed but empty/wrong-shaped reply must not be served as success
        # (that produced blank downloads before).
        revamped = result.get("revamped_cv") if isinstance(result, dict) else None
        if not isinstance(revamped, dict) or not revamped.get("name"):
            raise AIServiceError(
                "CV revamp returned an incomplete result. Please try again.",
                status_code=502,
            )
        logger.info(
            "CV_REVAMP_COMPLETE",
            extra={
                "role": target_role,
                "keywords_added": len(
                    result.get("revamped_cv", {}).get("keywords_added", [])
        ),
            },
        )

        return {
            "success": True,
            "target_role": target_role,
            "industry": industry,
            "revamp": result,
        }

    def _validate(self, cv_text: str, analysis: dict, target_role: str, industry: str):
        if not cv_text:
            raise AIServiceError("cv_text is required.", status_code=400)

        if len(cv_text) < 50:
            raise AIServiceError("CV text is too short.", status_code=400)

        if len(cv_text) > 15000:
            raise AIServiceError("CV text exceeds limit.", status_code=400)

        if analysis is None:
            raise AIServiceError("analysis is required.", status_code=400)

        if not target_role:
            raise AIServiceError("target_role is required.", status_code=400)

        if not industry:
            raise AIServiceError("industry is required.", status_code=400)