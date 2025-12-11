"""
FastAPI routes for Digital Twin service
"""

from fastapi import APIRouter, HTTPException
from openai import RateLimitError
from models.schemas import UserData, EconomicTwinResponse
from services.digital_twin import DigitalTwinGenerator
from utils.ai_client import AIClient

router = APIRouter()
twin_generator = DigitalTwinGenerator()

@router.post("/generate", response_model=EconomicTwinResponse)
async def generate_twin(user_data: UserData):
    """
    Generate a digital economic twin for a user
    """
    try:
        user_dict = user_data.model_dump()
        twin_data = twin_generator.generate_twin(user_dict)
        return EconomicTwinResponse(**twin_data)
    except RateLimitError as e:
        # Handle rate limit errors specifically
        raise HTTPException(
            status_code=429, 
            detail="OpenAI API rate limit exceeded. Please try again in a few moments."
        )
    except Exception as e:
        error_msg = str(e)
        # Check if it's a rate limit error in the message
        if "rate limit" in error_msg.lower() or "429" in error_msg:
            raise HTTPException(
                status_code=429,
                detail="OpenAI API rate limit exceeded. Please try again in a few moments."
            )
        raise HTTPException(status_code=500, detail=f"Error generating twin: {str(e)}")

@router.get("/health")
async def health_check():
    """Health check for twin service"""
    return {"status": "ok", "service": "digital_twin"}

