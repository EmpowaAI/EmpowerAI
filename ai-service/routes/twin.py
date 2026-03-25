"""
Digital Twin management routes
"""
from fastapi import APIRouter, HTTPException
from typing import Dict, Any
import uuid

router = APIRouter(prefix="/twin", tags=["Twin"])

# In-memory storage for demo
twins = {}

@router.get("/my-twin")
async def get_my_twin():
    """
    Get the current user's digital twin
    """
    try:
        # Return a demo twin if it exists
        if "demo" in twins:
            return twins["demo"]
        
        # Create a demo twin
        demo_twin = {
            "id": str(uuid.uuid4()),
            "name": "Demo User",
            "careerStage": "Early Career",
            "province": "Gauteng",
            "industry": "Information Technology",
            "education": "Bachelor's Degree",
            "skills": ["Python", "JavaScript", "Communication"],
            "challenges": "Finding entry-level roles",
            "goals": "Find a full-time job",
            "empowermentScore": 75
        }
        twins["demo"] = demo_twin
        return demo_twin
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/generate")
async def generate_twin(user_data: Dict[str, Any]):
    """
    Generate a new digital twin
    """
    try:
        twin_id = str(uuid.uuid4())
        new_twin = {
            "id": twin_id,
            **user_data,
            "empowermentScore": 75
        }
        twins[twin_id] = new_twin
        twins["demo"] = new_twin
        return new_twin
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))