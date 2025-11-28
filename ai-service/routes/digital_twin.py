"""
FastAPI routes for Digital Twin service
"""

from fastapi import APIRouter, HTTPException
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
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating twin: {str(e)}")

@router.get("/health")
async def health_check():
    """Health check for twin service"""
    return {"status": "ok", "service": "digital_twin"}

