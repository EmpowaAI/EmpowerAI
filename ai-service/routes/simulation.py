"""
FastAPI routes for Simulation Engine
"""

from fastapi import APIRouter, HTTPException
from typing import List, Optional
from models.schemas import PathSimulationResponse, UserData
from services.simulation_engine import SimulationEngine

router = APIRouter()
simulation_engine = SimulationEngine()

@router.post("/paths", response_model=List[PathSimulationResponse])
async def simulate_paths(
    user_data: UserData,
    path_ids: Optional[List[str]] = None
):
    """
    Simulate multiple career paths for a user
    """
    try:
        user_dict = user_data.model_dump()
        
        # Add skill vector if not present (would come from twin)
        if 'skillVector' not in user_dict:
            from services.digital_twin import DigitalTwinGenerator
            twin_gen = DigitalTwinGenerator()
            twin_data = twin_gen.generate_twin(user_dict)
            user_dict['skillVector'] = twin_data['skillVector']
        
        if path_ids:
            # Simulate specific paths
            results = []
            for path_id in path_ids:
                result = simulation_engine.simulate_path(path_id, user_dict)
                results.append(PathSimulationResponse(**result))
            return results
        else:
            # Simulate all paths
            results = simulation_engine.simulate_all_paths(user_dict)
            return [PathSimulationResponse(**r) for r in results]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error running simulation: {str(e)}")

@router.post("/best-path", response_model=PathSimulationResponse)
async def get_best_path(user_data: UserData):
    """
    Get the best recommended path for a user
    """
    try:
        user_dict = user_data.model_dump()
        
        # Generate twin first
        from services.digital_twin import DigitalTwinGenerator
        twin_gen = DigitalTwinGenerator()
        twin_data = twin_gen.generate_twin(user_dict)
        user_dict['skillVector'] = twin_data['skillVector']
        user_dict['province'] = user_data.province
        
        # Simulate all paths
        all_results = simulation_engine.simulate_all_paths(user_dict)
        best_path = simulation_engine.get_best_path(all_results)
        
        return PathSimulationResponse(**best_path)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error finding best path: {str(e)}")

@router.get("/health")
async def health_check():
    """Health check for simulation service"""
    return {"status": "ok", "service": "simulation"}

