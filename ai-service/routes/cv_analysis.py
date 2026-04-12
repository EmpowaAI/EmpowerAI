"""
FastAPI routes for CV Analysis
"""

from fastapi import APIRouter, HTTPException, Request
from openai import RateLimitError
from models.schemas import CVAnalysisRequest, CVAnalysisResponse
from services.cv_analyzer import CVAnalyzer
from utils.logger import get_logger

router = APIRouter()
cv_analyzer = CVAnalyzer()

@router.post("/analyze", response_model=CVAnalysisResponse)
async def analyze_cv(request: CVAnalysisRequest, req: Request):
    """
    Analyze CV text and extract skills, identify gaps, and provide suggestions
    Implements comprehensive error handling with graceful degradation
    """
    correlation_id = req.headers.get('X-Correlation-ID')
    logger = get_logger(correlation_id)
    
    try:
        # Validate input
        if not request.cvText or not request.cvText.strip():
            raise HTTPException(status_code=400, detail="CV text is required and cannot be empty")
        
        if len(request.cvText) > 50000:
            raise HTTPException(status_code=413, detail="CV text exceeds maximum length of 50000 characters")
        
        logger.info(f"CV analysis started - Text length: {len(request.cvText)} chars")
        
        result = await cv_analyzer.analyze_cv(
            request.cvText,
            request.jobRequirements
        )
        
        # Validate result has required fields
        required_fields = ['extractedSkills', 'education', 'experience', 'score', 'industry']
        for field in required_fields:
            if field not in result or result[field] is None:
                logger.warning(f"Missing required field in result: {field}, setting default")
                if field == 'extractedSkills' or field == 'education' or field == 'experience':
                    result[field] = []
                elif field == 'score':
                    result[field] = 50
                elif field == 'industry':
                    result[field] = 'general'
        
        # Ensure all arrays have some content
        if not result.get('extractedSkills'):
            result['extractedSkills'] = ['Communication', 'Time Management', 'Problem Solving']
            logger.warning("No skills extracted, using defaults")
        
        if not result.get('suggestions'):
            result['suggestions'] = ['Add quantifiable achievements to strengthen CV', 'Include industry-specific keywords']
            logger.warning("No recommendations generated, using defaults")
        
        logger.info(f"CV analysis completed - Industry: {result.get('industry')}, Score: {result.get('score')}, Skills found: {len(result.get('extractedSkills', []))}")
        
        return CVAnalysisResponse(**result)
        
    except HTTPException:
        # Re-raise HTTP exceptions as-is
        raise
    except RateLimitError as e:
        logger.error(f"OpenAI rate limit hit: {str(e)}")
        retry_after = 60
        if hasattr(e, 'response') and e.response:
            retry_after_header = e.response.headers.get('retry-after')
            if retry_after_header:
                try:
                    retry_after = int(retry_after_header)
                except:
                    pass
        raise HTTPException(
            status_code=429,
            detail="Analysis service is temporarily overloaded. Please try again in a few moments.",
            headers={"Retry-After": str(retry_after)}
        )
    except ValueError as e:
        logger.error(f"Validation error in CV analysis: {str(e)}")
        raise HTTPException(status_code=422, detail=f"Invalid data: {str(e)}")
    except Exception as e:
        logger.error(f"Unexpected error in CV analysis: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500, 
            detail="Unable to analyze CV at this moment. Please try again or use a different CV format."
        )

@router.get("/health")
async def health_check():
    """Health check for CV analysis service"""
    return {"status": "ok", "service": "cv_analysis"}