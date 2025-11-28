"""
Pydantic models for request/response validation
"""

from pydantic import BaseModel, EmailStr, Field
from typing import List, Dict, Any, Optional

# User Data Models
class UserData(BaseModel):
    name: str
    age: int = Field(..., ge=16, le=35, description="Age must be between 16 and 35")
    province: str
    skills: List[str] = []
    education: str
    interests: Optional[List[str]] = []
    experience: Optional[str] = None

# Digital Twin Models
class IncomeProjection(BaseModel):
    threeMonth: float
    sixMonth: float
    twelveMonth: float

class GrowthModel(BaseModel):
    skillGrowth: List[float]
    employabilityIndex: float
    recommendedPaths: List[str]

class EconomicTwinResponse(BaseModel):
    skillVector: List[float]
    incomeProjection: IncomeProjection
    empowermentScore: float
    growthModel: GrowthModel

# Simulation Models
class SimulationResult(BaseModel):
    income: float
    skillGrowth: float
    employabilityIndex: float
    milestones: List[str]

class PathProjections(BaseModel):
    threeMonth: Optional[SimulationResult] = None
    sixMonth: Optional[SimulationResult] = None
    twelveMonth: Optional[SimulationResult] = None
    
    class Config:
        from_attributes = True

class PathSimulationResponse(BaseModel):
    pathId: str
    pathName: str
    description: str
    projections: PathProjections

# CV Analysis Models
class CVAnalysisRequest(BaseModel):
    cvText: str
    jobRequirements: Optional[List[str]] = None

class CVAnalysisResponse(BaseModel):
    extractedSkills: List[str]
    missingSkills: List[str]
    suggestions: List[str]
    improvedVersion: Optional[str] = None

# Interview Coach Models
class InterviewStartRequest(BaseModel):
    type: str = Field(..., pattern="^(tech|non-tech|behavioral)$")
    difficulty: str = Field(default="medium", pattern="^(easy|medium|hard)$")
    company: Optional[str] = None

class InterviewQuestion(BaseModel):
    id: str
    question: str
    type: str
    difficulty: str

class InterviewSessionResponse(BaseModel):
    sessionId: str
    type: str
    questions: List[InterviewQuestion]
    currentQuestionIndex: int
    feedback: List[Dict[str, Any]] = []

class InterviewAnswerRequest(BaseModel):
    questionId: str
    response: str

class InterviewFeedback(BaseModel):
    questionId: str
    response: str
    score: float
    feedback: str
    suggestions: List[str]

