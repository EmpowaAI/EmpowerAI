"""
Pydantic models for request/response validation
"""

from pydantic import BaseModel, EmailStr, Field, field_validator
from typing import List, Dict, Any, Optional
from datetime import datetime

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

# Income Idea Model
class IncomeIdea(BaseModel):
    title: str
    difficulty: str
    potential: str
    description: str

# CV Section Models
class CVSections(BaseModel):
    about: Optional[str] = ""
    skills: List[str] = []
    education: List[str] = []
    experience: List[str] = []
    achievements: List[str] = []

class CVData(BaseModel):
    sections: Optional[CVSections] = None
    score: Optional[int] = None
    readinessLevel: Optional[str] = None
    summary: Optional[str] = None

# CV Analysis Models
class CVAnalysisRequest(BaseModel):
    cvText: str
    jobRequirements: Optional[List[str]] = None

class CVAnalysisResponse(BaseModel):
    extractedSkills: List[str] = Field(default_factory=list)
    missingSkills: List[str] = Field(default_factory=list)
    marketKeywords: List[str] = Field(default_factory=list)
    suggestions: List[str] = Field(default_factory=list)
    about: str = Field(default="")
    education: List[str] = Field(default_factory=list)
    experience: List[str] = Field(default_factory=list)
    achievements: List[str] = Field(default_factory=list)
    cvText: str = Field(default="")
    links: Optional[Dict[str, bool]] = Field(default=None)
    incomeIdeas: Optional[List[IncomeIdea]] = Field(default=None)
    
    class Config:
        json_schema_extra = {
            "example": {
                "extractedSkills": ["python", "javascript", "react"],
                "missingSkills": ["aws", "docker"],
                "marketKeywords": ["Next.js", "TypeScript", "GraphQL", "Docker", "CI/CD"],
                "suggestions": ["Add more technical skills", "Include quantifiable achievements"],
                "about": "Experienced software developer with 5 years of experience",
                "education": ["BSc Computer Science - University of Technology"],
                "experience": ["Software Developer at Tech Company (2020-present)"],
                "achievements": ["Increased application performance by 30%"],
                "cvText": "Full CV text here...",
                "links": {
                    "linkedin": True,
                    "github": False,
                    "portfolio": False
                },
                "incomeIdeas": [
                    {
                        "title": "Freelance Development",
                        "difficulty": "MEDIUM",
                        "potential": "HIGH",
                        "description": "Offer your development services on freelance platforms"
                    }
                ]
            }
        }

# Interview Coach Models
class InterviewStartRequest(BaseModel):
    type: str = Field(..., description="Interview type: tech, behavioral, or non-tech")
    difficulty: str = Field(default="medium", description="easy, medium, or hard")
    company: Optional[str] = Field(None, description="Target company for questions")
    cvData: Optional[CVData] = Field(None, description="User's CV data for personalization")
    
    @field_validator('type')
    def validate_type(cls, v):
        if v not in ['tech', 'behavioral', 'non-tech']:
            raise ValueError('type must be tech, behavioral, or non-tech')
        return v
    
    @field_validator('difficulty')
    def validate_difficulty(cls, v):
        if v not in ['easy', 'medium', 'hard']:
            raise ValueError('difficulty must be easy, medium, or hard')
        return v

class InterviewQuestion(BaseModel):
    id: str
    text: str
    question: Optional[str] = None
    type: str
    difficulty: str
    
    class Config:
        populate_by_name = True
        json_schema_extra = {
            "example": {
                "id": "q1_12345",
                "text": "Tell me about a challenging project you worked on.",
                "type": "behavioral",
                "difficulty": "medium"
            }
        }

class InterviewSessionResponse(BaseModel):
    sessionId: str
    type: str
    difficulty: str
    company: Optional[str] = None
    questions: List[InterviewQuestion]
    currentQuestionIndex: int = 0
    feedback: List[Dict[str, Any]] = []
    startedAt: Optional[datetime] = None
    cvUsed: bool = False

class InterviewAnswerRequest(BaseModel):
    sessionId: str
    questionId: str
    response: str = Field(..., min_length=1, description="User's answer to the question")
    cvData: Optional[CVData] = Field(None, description="User's CV data for personalized feedback")

class InterviewFeedback(BaseModel):
    questionId: str
    response: str
    score: int = Field(..., ge=0, le=100, description="Score from 0-100")
    feedback: str
    strengths: List[str] = Field(default_factory=list)
    improvements: List[str] = Field(default_factory=list)
    suggestedAnswer: Optional[str] = None
    
    class Config:
        json_schema_extra = {
            "example": {
                "questionId": "q1_12345",
                "response": "I worked on a team project...",
                "score": 85,
                "feedback": "Good use of STAR method with specific examples.",
                "strengths": ["Clear structure", "Specific example", "Quantified results"],
                "improvements": ["Could mention team collaboration more"],
                "suggestedAnswer": "In my previous role..."
            }
        }