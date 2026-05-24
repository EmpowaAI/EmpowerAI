from app.core.aiClient import AIClient
from app.core.parser import extract_json
from app.core.exceptions import AIServiceError
from app.modules.cvAnalyser.prompts import build_cv_analysis_prompt
from app.utils.logger import logger


class CVAnalyzerService:
    SYSTEM_PROMPT = (
        "You are a senior recruitment consultant and ATS optimization expert. "
        "You return only valid JSON — no markdown, no explanation, no preamble. "
        "Every analysis must be specific to the actual CV content provided."
    )

    def __init__(self):
        self.client = AIClient()

    def analyze(self, payload: dict) -> dict:
        cv_text = (payload.get("cv_text") or "").strip()
        target_role = (payload.get("target_role") or "").strip()
        industry = (payload.get("industry") or "").strip()
        job_description = payload.get("job_description")
        location = (payload.get("location") or "").strip()

        self._validate(cv_text, target_role, industry)

        logger.info(
            "CV_ANALYSIS_START",
            extra={
                "role": target_role,
                "industry": industry,
                "has_jd": bool(job_description),
                "cv_chars": len(cv_text),
            },
        )

        prompt = build_cv_analysis_prompt(
            cv_text=cv_text,
            target_role=target_role,
            industry=industry,
            job_description=job_description,
            location=location,
        )

        try:
            raw = self.client.complete(
                prompt=prompt,
                system=self.SYSTEM_PROMPT,
                max_tokens=8000,
            )

            result = extract_json(raw)

            logger.info(
                "CV_ANALYSIS_COMPLETE",
                extra={"role": target_role, "industry": industry},
            )

            return {
                "success": True,
                "target_role": target_role,
                "industry": industry,
                "analysis": result,
            }

        except Exception as e:
            logger.error(
                "CV_ANALYSIS_FAILED",
                extra={
                    "error": str(e),
                    "role": target_role,
                    "industry": industry,
                },
            )
            raise AIServiceError(
                "CV analysis failed due to internal error.",
                status_code=500,
            )

    def _validate(self, cv_text: str, target_role: str, industry: str):
        if not cv_text:
            raise AIServiceError("cv_text is required.", status_code=400)

        if len(cv_text) < 50:
            raise AIServiceError(
                "CV text is too short. Please provide the full CV content.",
                status_code=400,
            )

        if len(cv_text) > 30000:
            raise AIServiceError(
                "CV text exceeds the 30,000 character limit.",
                status_code=400,
            )

        if not target_role:
            raise AIServiceError("target_role is required.", status_code=400)

        if not industry:
            raise AIServiceError("industry is required.", status_code=400)