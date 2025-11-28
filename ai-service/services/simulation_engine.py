"""
Simulation Engine Service
Runs path simulations for different career/earning pathways
"""

from typing import List, Dict, Any
from datetime import datetime, timedelta

class SimulationEngine:
    """Simulates economic outcomes for different paths"""
    
    def __init__(self):
        self.paths = {
            'learnership': {
                'name': 'Learnership Program',
                'base_income': 3500,
                'growth_rate': 0.15
            },
            'freelancing': {
                'name': 'Freelancing',
                'base_income': 2500,
                'growth_rate': 0.25
            },
            'short_course': {
                'name': 'Short Course + Job',
                'base_income': 4000,
                'growth_rate': 0.20
            },
            'entry_tech': {
                'name': 'Entry-Level Tech Role',
                'base_income': 6000,
                'growth_rate': 0.18
            }
        }
    
    def simulate_path(
        self, 
        path_id: str, 
        twin_data: Dict[str, Any],
        months: int = 12
    ) -> Dict[str, Any]:
        """
        Simulate a specific path
        TODO: Implement with AI-powered predictions
        """
        path = self.paths.get(path_id, self.paths['learnership'])
        
        # Placeholder simulation logic
        base_income = path['base_income']
        growth_rate = path['growth_rate']
        
        projections = {}
        for period in [3, 6, 12]:
            if period <= months:
                income = base_income * (1 + growth_rate) ** (period / 12)
                projections[f'{period}Month'] = {
                    'income': round(income, 2),
                    'skillGrowth': 0.5 + (period / 12) * 0.3,
                    'employabilityIndex': 0.4 + (period / 12) * 0.4,
                    'milestones': self._generate_milestones(path_id, period)
                }
        
        return {
            'pathId': path_id,
            'pathName': path['name'],
            'projections': projections
        }
    
    def _generate_milestones(self, path_id: str, months: int) -> List[str]:
        """Generate milestones for a path"""
        # Placeholder
        return [
            f'Complete {path_id} orientation',
            f'Begin practical work after {months//2} months',
            f'Complete {path_id} program'
        ]
    
    def simulate_all_paths(
        self, 
        twin_data: Dict[str, Any]
    ) -> List[Dict[str, Any]]:
        """Simulate all available paths"""
        results = []
        for path_id in self.paths.keys():
            result = self.simulate_path(path_id, twin_data)
            results.append(result)
        return results

