"""
Simulation Engine Service
Runs path simulations for different career/earning pathways
"""

from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from utils.sa_market_data import get_path_data, calculate_adjusted_income, PATH_BASE_SALARIES

class SimulationEngine:
    """Simulates economic outcomes for different paths"""
    
    def __init__(self):
        self.paths = PATH_BASE_SALARIES
    
    def simulate_path(
        self, 
        path_id: str, 
        twin_data: Dict[str, Any],
        months: int = 12
    ) -> Dict[str, Any]:
        """
        Simulate a specific path with realistic SA market data
        """
        path_config = get_path_data(path_id)
        skill_vector = twin_data.get('skillVector', [0.5] * 6)
        province = twin_data.get('province', 'Gauteng')
        
        base_income = path_config['base']
        growth_rate = path_config['growth_rate']
        description = path_config['description']
        
        # Adjust base income for skills and province
        adjusted_base = calculate_adjusted_income(base_income, province, skill_vector)
        
        projections = {}
        for period in [3, 6, 12]:
            if period <= months:
                # Income calculation with compound growth
                months_factor = period / 12.0
                income = adjusted_base * (1 + growth_rate * months_factor)
                
                # Skill growth: improves over time
                avg_skill = sum(skill_vector) / len(skill_vector) if skill_vector else 0.5
                skill_growth = min(avg_skill + (months_factor * 0.3), 1.0)
                
                # Employability index: improves with experience and skills
                base_employability = avg_skill * 0.6
                experience_boost = months_factor * 0.3
                employability_index = min(base_employability + experience_boost, 1.0)
                
                milestones = self._generate_milestones(path_id, period, province)
                
                projections[f'{period}Month'] = {
                    'income': round(income, 2),
                    'skillGrowth': round(skill_growth, 3),
                    'employabilityIndex': round(employability_index, 3),
                    'milestones': milestones
                }
        
        return {
            'pathId': path_id,
            'pathName': path_config.get('name', path_id.replace('_', ' ').title()),
            'description': description,
            'projections': projections
        }
    
    def _generate_milestones(self, path_id: str, months: int, province: str) -> List[str]:
        """Generate realistic milestones for a path"""
        milestones = []
        
        if path_id == 'learnership':
            if months >= 3:
                milestones.append("Complete learnership orientation and onboarding")
            if months >= 6:
                milestones.append("Begin practical workplace experience")
            if months >= 12:
                milestones.append("Complete learnership program and receive certificate")
                milestones.append("Qualify for permanent employment opportunities")
        
        elif path_id == 'freelancing':
            if months >= 3:
                milestones.append("Build initial client portfolio (3-5 clients)")
            if months >= 6:
                milestones.append("Establish steady income stream")
                milestones.append("Develop specialized skills in chosen niche")
            if months >= 12:
                milestones.append("Scale to R5,000+ monthly income")
                milestones.append("Build professional network and referrals")
        
        elif path_id == 'short_course':
            if months >= 3:
                milestones.append("Complete short course certification")
            if months >= 6:
                milestones.append("Secure entry-level position")
                milestones.append("Apply learned skills in workplace")
            if months >= 12:
                milestones.append("Demonstrate competency for promotion")
                milestones.append("Consider advanced training opportunities")
        
        elif path_id == 'entry_tech':
            if months >= 3:
                milestones.append("Complete onboarding and training period")
            if months >= 6:
                milestones.append("Contribute to team projects independently")
                milestones.append("Master core tech stack")
            if months >= 12:
                milestones.append("Eligible for salary review and promotion")
                milestones.append("Mentor junior developers")
        
        elif path_id == 'internship':
            if months >= 3:
                milestones.append("Complete internship orientation")
            if months >= 6:
                milestones.append("Take on independent projects")
            if months >= 12:
                milestones.append("Convert to full-time position")
        
        elif path_id == 'graduate_program':
            if months >= 3:
                milestones.append("Complete graduate program induction")
            if months >= 6:
                milestones.append("Rotate through different departments")
            if months >= 12:
                milestones.append("Secure permanent role in chosen department")
        
        # Add province-specific milestone
        if months >= 6:
            milestones.append(f"Build professional network in {province}")
        
        return milestones[:5]  # Limit to 5 milestones
    
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
    
    def get_best_path(self, simulation_results: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Determine the best path based on 12-month income projection"""
        if not simulation_results:
            return {}
        
        best_path = max(
            simulation_results,
            key=lambda x: x.get('projections', {}).get('twelveMonth', {}).get('income', 0)
        )
        return best_path

