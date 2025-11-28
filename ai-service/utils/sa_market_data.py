"""
South African Market Data
Salary benchmarks and market information for simulations
"""

# Province-based cost of living multipliers
PROVINCE_MULTIPLIERS = {
    "Gauteng": 1.0,  # Baseline
    "Western Cape": 0.95,
    "KwaZulu-Natal": 0.90,
    "Eastern Cape": 0.85,
    "Limpopo": 0.80,
    "Mpumalanga": 0.82,
    "North West": 0.80,
    "Free State": 0.83,
    "Northern Cape": 0.78
}

# Base salaries by path (in ZAR per month)
PATH_BASE_SALARIES = {
    "learnership": {
        "base": 3500,
        "growth_rate": 0.15,
        "description": "Structured learnership program with stipend"
    },
    "freelancing": {
        "base": 2500,
        "growth_rate": 0.25,
        "description": "Freelance work (gig economy)"
    },
    "short_course": {
        "base": 4000,
        "growth_rate": 0.20,
        "description": "Short course completion leading to entry-level role"
    },
    "entry_tech": {
        "base": 6000,
        "growth_rate": 0.18,
        "description": "Entry-level tech position"
    },
    "internship": {
        "base": 3000,
        "growth_rate": 0.22,
        "description": "Paid internship program"
    },
    "graduate_program": {
        "base": 8000,
        "growth_rate": 0.16,
        "description": "Graduate development program"
    }
}

# Skill value multipliers (how much each skill category adds to earning potential)
SKILL_MULTIPLIERS = {
    "technical": 1.3,
    "communication": 1.15,
    "leadership": 1.25,
    "problem_solving": 1.20,
    "creativity": 1.10,
    "analytical": 1.25
}

def get_province_multiplier(province: str) -> float:
    """Get cost of living/earning multiplier for province"""
    return PROVINCE_MULTIPLIERS.get(province, 1.0)

def get_path_data(path_id: str) -> dict:
    """Get path configuration data"""
    return PATH_BASE_SALARIES.get(path_id, PATH_BASE_SALARIES["learnership"])

def calculate_adjusted_income(base_income: float, province: str, skill_vector: list) -> float:
    """Calculate income adjusted for province and skills"""
    province_mult = get_province_multiplier(province)
    
    # Average skill multiplier
    skill_mult = 1.0
    if skill_vector and len(skill_vector) > 0:
        avg_skill = sum(skill_vector) / len(skill_vector)
        skill_mult = 1.0 + (avg_skill * 0.3)  # Up to 30% boost from skills
    
    return base_income * province_mult * skill_mult

