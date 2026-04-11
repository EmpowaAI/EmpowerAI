"""
FastAPI routes for CV Revamp
"""

from fastapi import APIRouter, HTTPException, Request
import sys
import os
from openai import RateLimitError
import traceback
import uuid

# Add parent directory to path for imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from models.schemas import CVRevampRequest
from services.cv_revamp_service import CVRevampService

router = APIRouter()

@router.post("/revamp")
async def revamp_cv(request: CVRevampRequest, req: Request):
    """
    Revamp CV to achieve 95%+ ATS compatibility
    Returns structured data with original score, new score, changes, and revamped CV
    """
    request_id = str(uuid.uuid4())[:8]
    
    try:
        # CREATE FRESH SERVICE INSTANCE FOR THIS REQUEST
        cv_revamp_service = CVRevampService()
        
        if not request.cvData:
            raise HTTPException(status_code=400, detail="No CV data provided for revamp")
        
        result = await cv_revamp_service.revamp_cv(request.cvData)
        
        return result
        
    except RateLimitError as e:
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
            detail="OpenAI API rate limit exceeded. Please try again in a few moments.",
            headers={"Retry-After": str(retry_after)}
        )
    except HTTPException:
        raise
    except Exception as e:
        print(f"[{request_id}] ❌ Error in CV revamp: {str(e)}")
        print(traceback.format_exc())
        # Prefer 503 for upstream/LLM issues; the service includes a non-AI fallback,
        # but keep this defensive so clients don't see a generic 500 for transient errors.
        raise HTTPException(status_code=503, detail=f"CV revamp temporarily unavailable: {str(e)}")
