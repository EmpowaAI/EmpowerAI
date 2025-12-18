"""
FastAPI routes for CV Analysis
"""

from fastapi import APIRouter, HTTPException
from openai import RateLimitError
from models.schemas import CVAnalysisRequest, CVAnalysisResponse
from services.cv_analyzer import CVAnalyzer

router = APIRouter()
cv_analyzer = CVAnalyzer()

@router.post("/analyze", response_model=CVAnalysisResponse)
async def analyze_cv(request: CVAnalysisRequest):
    """
    Analyze CV text and extract skills, identify gaps, and provide suggestions
    """
    try:
        result = cv_analyzer.analyze_cv(
            request.cvText,
            request.jobRequirements
        )
        return CVAnalysisResponse(**result)
    except RateLimitError as e:
        raise HTTPException(
            status_code=429,
            detail="OpenAI API rate limit exceeded. Please try again in a few moments."
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error analyzing CV: {str(e)}")

@router.get("/health")
async def health_check():
    """Health check for CV analysis service"""
    return {"status": "ok", "service": "cv_analysis"}

