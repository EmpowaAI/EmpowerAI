"""
Digital Twin API Routes
Handles AI-powered twin generation from CV analysis data.
Persistence is managed by the Node backend; this service is stateless.
"""
import uuid
from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel
from typing import Dict, Any, Optional
from utils.logger import get_logger

from services.digital_twin import DigitalTwinGenerator

router = APIRouter(prefix="/twin", tags=["Digital Twin"])

twin_generator = DigitalTwinGenerator()


class CreateTwinRequest(BaseModel):
    """Request for generating a twin from CV analysis or manual data."""
    user_id: Optional[str] = None       # Passed by Node backend for logging
    cv_analysis: Optional[Dict[str, Any]] = None
    manual_data: Optional[Dict[str, Any]] = None


@router.post("/generate")
async def generate_twin(request: CreateTwinRequest, req: Request):
    """
    Generate an AI-enriched digital twin from CV analysis data.
    Returns the raw twin dict (identity/economy/skills/market/intelligence).
    The Node backend is responsible for persisting the result to MongoDB.
    """
    correlation_id = req.headers.get("X-Correlation-ID", str(uuid.uuid4()))
    logger = get_logger(correlation_id)

    try:
        logger.info("Generating digital twin", extra={
            "user_id": request.user_id,
            "has_cv": bool(request.cv_analysis),
            "has_manual": bool(request.manual_data),
        })

        cv_data: Dict[str, Any] = {}
        if request.cv_analysis:
            cv_data.update(request.cv_analysis)
        if request.manual_data:
            cv_data.update(request.manual_data)

        if not cv_data:
            raise HTTPException(status_code=400, detail="Must provide cv_analysis or manual_data")

        # generate_twin_with_ai: rule-based base + Azure OpenAI enrichment
        # Falls back to rule-based twin if AI is unavailable
        twin_data = await twin_generator.generate_twin_with_ai(cv_data)

        logger.info("Digital twin generated", extra={
            "user_id": request.user_id,
            "employability_score": twin_data.get("economy", {}).get("employabilityScore"),
            "industry": twin_data.get("identity", {}).get("industry"),
            "skill_count": len(twin_data.get("skills", {}).get("core", [])),
        })

        return twin_data

    except HTTPException:
        raise
    except Exception as e:
        logger.error("Twin generation failed", extra={"error": str(e), "user_id": request.user_id})
        raise HTTPException(status_code=500, detail=f"Twin generation failed: {str(e)}")


@router.get("/health")
async def twin_health():
    return {
        "status": "healthy",
        "service": "digital_twin",
        "generator": "ready",
    }
