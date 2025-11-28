"""
Digital Twin Service
Generates AI-powered digital economic twins for users
"""

from typing import List, Dict, Any, Optional
import numpy as np
import sys
import os

# Add parent directory to path for imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from utils.ai_client import AIClient
from utils.sa_market_data import get_province_multiplier, calculate_adjusted_income

class DigitalTwinGenerator:
    """Generates and manages digital economic twins"""
    
    def __init__(self, ai_client: Optional[AIClient] = None):
        self.skill_categories = [
            'technical', 'communication', 'leadership', 
            'problem_solving', 'creativity', 'analytical'
        ]
        self.ai_client = ai_client or AIClient()
    
    def generate_skill_vector(self, user_data: Dict[str, Any]) -> List[float]:
        """
        Generate skill vector from user data using AI
        Returns normalized vector [0-1] for each skill category
        """
        # Get values safely, handling None cases
        skills_raw = user_data.get('skills')
        experience_raw = user_data.get('experience')
        education_raw = user_data.get('education')
        
        # Convert to safe types
        if skills_raw is None:
            skills = []
        elif isinstance(skills_raw, list):
            skills = [str(s) for s in skills_raw if s is not None]
        else:
            skills = []
        
        experience = str(experience_raw) if experience_raw is not None else ''
        education = str(education_raw) if education_raw is not None else ''
        
        # Combine all text for skill extraction (ensure skills is a list)
        skills_list = skills if isinstance(skills, list) else []
        skill_text = ' '.join(str(s) for s in skills_list) + ' ' + experience + ' ' + education
        
        # Use AI to extract and categorize skills
        if skill_text.strip() and self.ai_client:
            try:
                extracted_skills = self.ai_client.extract_skills(skill_text)
                skills.extend(extracted_skills)
            except Exception as e:
                print(f"AI skill extraction error: {e}")
        
        # Map skills to categories and create vector
        skill_vector = [0.0] * len(self.skill_categories)
        
        # Technical skills
        tech_keywords = ['python', 'javascript', 'coding', 'programming', 'tech', 'software', 
                        'web', 'app', 'database', 'sql', 'html', 'css', 'react', 'node']
        tech_count = sum(1 for skill in skills if any(kw in skill.lower() for kw in tech_keywords))
        skill_vector[0] = min(tech_count / 3.0, 1.0)  # Technical
        
        # Communication skills
        comm_keywords = ['communication', 'presentation', 'writing', 'speaking', 'english', 
                        'customer service', 'client', 'team']
        comm_count = sum(1 for skill in skills if any(kw in skill.lower() for kw in comm_keywords))
        skill_vector[1] = min(comm_count / 2.0, 1.0)  # Communication
        
        # Leadership skills
        lead_keywords = ['leadership', 'management', 'supervision', 'team lead', 'coordination']
        lead_count = sum(1 for skill in skills if any(kw in skill.lower() for kw in lead_keywords))
        skill_vector[2] = min(lead_count / 2.0, 1.0)  # Leadership
        
        # Problem solving
        problem_keywords = ['problem solving', 'analytical', 'troubleshooting', 'debugging', 
                           'critical thinking', 'analysis']
        problem_count = sum(1 for skill in skills if any(kw in skill.lower() for kw in problem_keywords))
        skill_vector[3] = min(problem_count / 2.0, 1.0)  # Problem solving
        
        # Creativity
        creative_keywords = ['creative', 'design', 'innovation', 'artistic', 'content creation']
        creative_count = sum(1 for skill in skills if any(kw in skill.lower() for kw in creative_keywords))
        skill_vector[4] = min(creative_count / 2.0, 1.0)  # Creativity
        
        # Analytical
        analytical_keywords = ['analytical', 'data', 'research', 'statistics', 'excel', 'reporting']
        analytical_count = sum(1 for skill in skills if any(kw in skill.lower() for kw in analytical_keywords))
        skill_vector[5] = min(analytical_count / 2.0, 1.0)  # Analytical
        
        # Normalize: ensure at least some baseline
        for i in range(len(skill_vector)):
            if skill_vector[i] == 0:
                skill_vector[i] = 0.2  # Baseline potential
        
        return skill_vector
    
    def calculate_empowerment_score(
        self, 
        skill_vector: List[float],
        income_projection: Dict[str, float],
        province: str
    ) -> float:
        """
        Calculate Youth Economic Empowerment Score (0-100)
        Combines skill level, income potential, and province opportunities
        """
        # Skill component (0-60 points)
        avg_skill = np.mean(skill_vector)
        skill_score = avg_skill * 60
        
        # Income component (0-30 points)
        # Normalize income: R10,000/month = 30 points
        max_income = income_projection.get('twelveMonth', 0)
        income_score = min(max_income / 10000.0, 1.0) * 30
        
        # Province opportunity component (0-10 points)
        province_mult = get_province_multiplier(province)
        province_score = province_mult * 10
        
        total_score = skill_score + income_score + province_score
        return round(min(total_score, 100.0), 2)
    
    def generate_recommended_paths(
        self, 
        skill_vector: List[float], 
        user_data: Dict[str, Any]
    ) -> List[str]:
        """Generate AI-powered path recommendations"""
        # Ensure skill_vector is valid
        if not skill_vector or len(skill_vector) < 2:
            return ["learnership", "short_course", "freelancing"]
        
        technical_score = skill_vector[0] if skill_vector[0] is not None else 0.0
        communication_score = skill_vector[1] if skill_vector[1] is not None else 0.0
        
        recommended = []
        
        # High technical skills -> tech paths
        if technical_score > 0.6:
            recommended.append("entry_tech")
            recommended.append("short_course")
        
        # Good communication -> freelancing, learnerships
        if communication_score > 0.5:
            recommended.append("freelancing")
            recommended.append("learnership")
        
        # Default paths for everyone
        if not recommended:
            recommended = ["learnership", "short_course", "freelancing"]
        
        return recommended[:3]  # Top 3
    
    def generate_twin(self, user_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generate complete digital twin with AI enhancement
        """
        skill_vector = self.generate_skill_vector(user_data)
        province = user_data.get('province', 'Gauteng')
        
        # Calculate base income projections (will be refined by simulation)
        avg_skill = np.mean(skill_vector)
        base_income = 3000 + (avg_skill * 2000)  # R3000-R5000 base
        
        income_projection = {
            'threeMonth': round(base_income * 0.8, 2),
            'sixMonth': round(base_income * 0.9, 2),
            'twelveMonth': round(base_income * 1.1, 2)
        }
        
        empowerment_score = self.calculate_empowerment_score(
            skill_vector, 
            income_projection,
            province
        )
        
        recommended_paths = self.generate_recommended_paths(skill_vector, user_data)
        
        # Calculate employability index
        employability_index = (
            avg_skill * 0.4 + 
            (empowerment_score / 100) * 0.4 + 
            (len(user_data.get('skills', [])) / 10.0) * 0.2
        )
        employability_index = min(employability_index, 1.0)
        
        return {
            'skillVector': [round(v, 3) for v in skill_vector],
            'incomeProjection': income_projection,
            'empowermentScore': empowerment_score,
            'growthModel': {
                'skillGrowth': [round(v * 1.2, 3) for v in skill_vector],  # Projected growth
                'employabilityIndex': round(employability_index, 3),
                'recommendedPaths': recommended_paths
            }
        }

