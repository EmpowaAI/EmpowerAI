"""
FastAPI routes for Digital Twin service
Principal Engineer Level: Proper error handling and logging
"""

from fastapi import APIRouter, HTTPException, Request
from models.schemas import UserData, EconomicTwinResponse
from services.digital_twin import DigitalTwinGenerator
from utils.exceptions import RateLimitExceeded, ModelError, ServiceUnavailableError
from utils.logger import get_logger

router = APIRouter()
twin_generator = DigitalTwinGenerator()

@router.post("/generate", response_model=EconomicTwinResponse)
async def generate_twin(user_data: UserData, request: Request):
    """
    Generate a digital economic twin for a user
    """
    correlation_id = request.headers.get('X-Correlation-ID')
    logger = get_logger(correlation_id)
    
    try:
        logger.info("Generating digital twin", extra={
            'user_name': user_data.name,
            'province': user_data.province,
            'skills_count': len(user_data.skills) if user_data.skills else 0
        })
        
        user_dict = user_data.model_dump()
        twin_data = twin_generator.generate_twin(user_dict)
        
        logger.info("Digital twin generated successfully", extra={
            'empowerment_score': twin_data.get('empowermentScore'),
            'recommended_paths_count': len(twin_data.get('recommendedPaths', []))
        })
        
        return EconomicTwinResponse(**twin_data)
        
    except RateLimitExceeded as e:
        logger.error("Rate limit exceeded", extra={
            'error': str(e),
            'retry_after': e.retry_after
        })
        raise HTTPException(
            status_code=429,
            detail={
                "message": e.message,
                "retry_after": e.retry_after
            }
        )
    except ModelError as e:
        logger.error("AI model error", extra={
            'error': str(e),
            'model': e.model
        })
        raise HTTPException(
            status_code=500,
            detail=f"AI model error: {e.message}"
        )
    except ServiceUnavailableError as e:
        logger.error("Service unavailable", extra={
            'error': str(e),
            'service': e.service
        })
        raise HTTPException(
            status_code=503,
            detail=f"Service unavailable: {e.message}"
        )
    except Exception as e:
        logger.error("Unexpected error generating twin", extra={
            'error': str(e),
            'error_type': type(e).__name__
        }, exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Error generating twin: {str(e)}"
        )

@router.get("/health")
async def health_check():
    """Health check for twin service"""
    return {"status": "ok", "service": "digital_twin"}

