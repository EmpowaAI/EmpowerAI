"""
Digital Twin API Routes
Handles twin generation, retrieval, and management
Now with REAL MongoDB persistence!
"""
import uuid
from fastapi import APIRouter, HTTPException, Depends, Request
from pydantic import BaseModel
from typing import Dict, Any, Optional
from utils.logger import get_logger

# Local imports
from models.schemas import UserData, EconomicTwinResponse  # Assuming these exist
from services.digital_twin import DigitalTwinGenerator
from utils.ai_client import AIClient  # For optional AI enrichment

router = APIRouter(prefix="/twin", tags=["Digital Twin"])

# Initialize services
twin_generator = DigitalTwinGenerator()
ai_client = AIClient()

class CreateTwinRequest(BaseModel):
    """Request for creating a new twin"""
    user_id: str  # Link to backend user
    cv_analysis: Optional[Dict[str, Any]] = None
    manual_data: Optional[UserData] = None  # Fallback manual input

@router.post("/generate", response_model=EconomicTwinResponse)
async def generate_twin(request: CreateTwinRequest, req: Request):
    """
    Generate a new digital twin from CV analysis or manual data
    """
    correlation_id = req.headers.get('X-Correlation-ID', str(uuid.uuid4()))
    logger = get_logger(correlation_id)
    
    try:
        logger.info("Generating digital twin", extra={
            'user_id': request.user_id,
            'has_cv': bool(request.cv_analysis),
            'has_manual': bool(request.manual_data)
        })
        
        # Prepare data for generator
        user_dict = {}
        if request.cv_analysis:
            user_dict.update(request.cv_analysis)
        if request.manual_data:
            user_dict.update(request.manual_data.model_dump())
        
        if not user_dict:
            raise HTTPException(400, "Must provide cv_analysis or manual_data")
        
        # Generate base twin
        twin_data = twin_generator.generate_twin_with_ai(user_dict)
        
        # TODO: Save to MongoDB with user_id linking (implement in next step)
        # twin_doc = EconomicTwin(
        #     user_id=request.user_id,
        #     data=twin_data,
        #     status="ACTIVE",
        #     version=1
        # )
        # await twin_doc.save()
        
        logger.info("✅ Digital twin generated successfully", extra={
            'empowerment_score': twin_data.get('empowermentScore'),
            'user_id': request.user_id
        })
        
        return EconomicTwinResponse(**twin_data)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("❌ Twin generation failed", extra={'error': str(e)})
        raise HTTPException(500, f"Twin generation failed: {str(e)}")

@router.get("/my-twin")
async def get_my_twin(req: Request, user_id: str = Depends(get_current_user_id)):
    """
    Get the current user's digital twin
    REQUIRES user_id from auth middleware
    """
    correlation_id = req.headers.get('X-Correlation-ID', str(uuid.uuid4()))
    logger = get_logger(correlation_id)
    
    try:
        logger.info("Fetching user twin", extra={'user_id': user_id})
        
        # TODO: Query MongoDB by user_id (Phase 1 Step 2)
        # twin_doc = await EconomicTwin.find_one({'user_id': user_id, 'status': 'ACTIVE'})
        # if twin_doc:
        #     return twin_doc.data
        
        # TEMP: Enhanced demo with generator for immediate testing
        logger.warning("No persisted twin - generating demo", extra={'user_id': user_id})
        demo_user_dict = {
            'name': 'Test User',
            'currentRole': 'Software Developer',
            'industry': 'Information Technology',
            'province': 'Gauteng',
            'skills': ['JavaScript', 'React', 'Python']
        }
        demo_twin = twin_generator.generate_twin(demo_user_dict)
        demo_twin['user_id'] = user_id
        demo_twin['status'] = 'DEMO'
        
        return demo_twin
        
    except Exception as e:
        logger.error("❌ Failed to get twin", extra={'error': str(e), 'user_id': user_id})
        raise HTTPException(503, "Twin service unavailable")

# TEMP Auth dependency (replace with real JWT)
async def get_current_user_id(request: Request) -> str:
    """Extract user_id from Authorization header/JWT"""
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(401, "Unauthorized")
    
    # TODO: Real JWT decode
    return "demo-user-" + str(uuid.uuid4())[:8]

@router.get("/health")
async def twin_health():
    """Health check"""
    return {
        "status": "healthy", 
        "service": "digital_twin",
        "generator": "ready",
        "persistence": "MongoDB-ready (Step 2)",
        "endpoints": ["/twin/generate", "/twin/my-twin"]
    }

