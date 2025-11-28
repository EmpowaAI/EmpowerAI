"""
FastAPI routes for Simulation Engine
"""

from fastapi import APIRouter, HTTPException, Body
from typing import List, Optional, Dict, Any
from pydantic import BaseModel
from models.schemas import PathSimulationResponse, UserData, SimulationResult, PathProjections
from services.simulation_engine import SimulationEngine

router = APIRouter()
simulation_engine = SimulationEngine()

class SimulationRequest(BaseModel):
    user_data: UserData
    path_ids: Optional[List[str]] = None

@router.post("/paths", response_model=List[PathSimulationResponse])
async def simulate_paths(request: SimulationRequest):
    """
    Simulate multiple career paths for a user
    """
    try:
        user_dict = request.user_data.model_dump()
        
        # Ensure province is set
        if 'province' not in user_dict or not user_dict.get('province'):
            user_dict['province'] = request.user_data.province
        
        # Add skill vector if not present (would come from twin)
        if 'skillVector' not in user_dict:
            from services.digital_twin import DigitalTwinGenerator
            twin_gen = DigitalTwinGenerator()
            twin_data = twin_gen.generate_twin(user_dict)
            user_dict['skillVector'] = twin_data['skillVector']
        
        if request.path_ids:
            # Simulate specific paths
            results = []
            for path_id in request.path_ids:
                result = simulation_engine.simulate_path(path_id, user_dict)
                # Convert projection dicts to SimulationResult objects
                projections_dict = result.get('projections', {})
                for key in ['threeMonth', 'sixMonth', 'twelveMonth']:
                    if key in projections_dict and projections_dict[key] is not None:
                        from models.schemas import SimulationResult
                        projections_dict[key] = SimulationResult(**projections_dict[key])
                result['projections'] = PathSimulationResponse.model_fields['projections'].annotation(**projections_dict)
                results.append(PathSimulationResponse(**result))
            return results
        else:
            # Simulate all paths
            results = simulation_engine.simulate_all_paths(user_dict)
            formatted_results = []
            for r in results:
                # Convert projection dicts to SimulationResult objects
                projections_dict = r.get('projections', {})
                formatted_projections = {}
                
                # Map from engine keys (3Month, 6Month, 12Month) to schema keys (threeMonth, sixMonth, twelveMonth)
                key_mapping = {
                    '3Month': 'threeMonth', 
                    '6Month': 'sixMonth', 
                    '12Month': 'twelveMonth'
                }
                
                for engine_key, schema_key in key_mapping.items():
                    if engine_key in projections_dict:
                        proj_data = projections_dict[engine_key]
                        if proj_data is not None and isinstance(proj_data, dict):
                            try:
                                formatted_projections[schema_key] = SimulationResult(**proj_data)
                            except Exception as e:
                                # If there's an error, log and set to None
                                import logging
                                logging.error(f"Error creating SimulationResult for {schema_key}: {e}")
                                formatted_projections[schema_key] = None
                        else:
                            formatted_projections[schema_key] = None
                    else:
                        formatted_projections[schema_key] = None
                
                # Create PathProjections and PathSimulationResponse
                path_projections = PathProjections(**formatted_projections)
                r['projections'] = path_projections
                formatted_results.append(PathSimulationResponse(**r))
            return formatted_results
    except Exception as e:
        import traceback
        error_detail = f"Error running simulation: {str(e)}\n{traceback.format_exc()}"
        raise HTTPException(status_code=500, detail=error_detail)

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

