"""
Chat routes for Digital Twin conversation
Handles the interactive profile building conversation with AI assistance
"""

from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import logging
import json
import re
import random
import sys
import os

# Add parent directory to path for imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from utils.ai_client import AIClient
from utils.logger import get_logger

# Create router WITHOUT prefix here - we'll add it in main.py
router = APIRouter(tags=["Chat"])
logger = logging.getLogger(__name__)

class ChatMessage(BaseModel):
    role: str  # "user" or "assistant"
    content: str

class ChatRequest(BaseModel):
    messages: List[ChatMessage]
    cv_context: Optional[Dict[str, Any]] = None
    focus: Optional[str] = None  # Added focus for personalization

class ChatResponse(BaseModel):
    reply: str
    options: Optional[List[str]] = None
    isComplete: Optional[bool] = False
    profile: Optional[Dict[str, Any]] = None

# Quiz flow steps
STEPS = [
    "greeting",      # 0 - Ask for name
    "name",          # 1 - Got name, ask for career stage
    "career_stage",  # 2 - Got career stage, ask for province
    "province",      # 3 - Got province, ask for industry
    "industry",      # 4 - Got industry, ask for education
    "education",     # 5 - Got education, ask for skills
    "skills",        # 6 - Got skills, ask for challenges
    "challenges",    # 7 - Got challenges, ask for goals
    "goals",         # 8 - Got goals, complete profile
    "complete"       # 9 - Profile complete
]

# SA market insights for variety
TRENDS = [
    "In South Africa right now, there's a big push for youth employment through programmes like YES and various SETA learnerships",
    "Right now in South Africa, many companies are boosting their youth hiring through programmes like YES and learnerships because of BBBEE incentives",
    "The tech scene in South Africa is buzzing with demand for developers, especially in Sandton and Cape Town",
    "The green economy is booming in SA with thousands of new roles in renewable energy across the Northern and Western Cape",
    "Finance sector in Gauteng is actively seeking young talent to boost their B-BBEE scorecards",
    "Manufacturing is resurging in KwaZulu-Natal, creating new opportunities for skilled workers",
    "Digital skills are in high demand across SA, with many companies offering learnerships to upskill young job seekers",
    "There's strong growth in learnership and internship opportunities as companies push youth employment through BBBEE and the YES programme"
]

# Initialize AI client
ai_client = AIClient()

# System prompts for each step to help AI understand context
STEP_PROMPTS = {
    0: "You are greeting a new user. Be warm and welcoming. Ask for their name.",
    1: "The user has provided their name. Acknowledge them and ask which career stage they're in. Options: Early Career (0-3 yrs), Mid Career (3-7 yrs), Established (7+ yrs)",
    2: "Ask which province they're based in. Options: Gauteng, Western Cape, KwaZulu-Natal, Other",
    3: "Ask what industry interests them. Options: Information Technology (IT), Finance & Accounting, Engineering, Healthcare, Retail & Sales, Administration",
    4: "Ask about their highest qualification. Options: Matric, Diploma, Bachelor's Degree, Postgraduate Degree, Certificate",
    5: "Ask about their skills. Options: Basic Coding, Customer Service, Sales, Administration, Data Analysis, Project Management, Communication, Leadership",
    6: "Ask about their biggest career challenge. Options: Finding entry-level roles, Lack of experience, Need more qualifications, Competition is too high, Don't know where to start",
    7: "Ask about their main career goal for next year. Options: Find a full-time job, Get a learnership/internship, Study further, Start my own business, Get certified",
    8: "All information collected. Summarize their profile and provide empowerment score."
}

@router.post("/chat/twin", response_model=ChatResponse)
async def chat_twin(request: ChatRequest, req: Request):
    """
    Digital Twin chat endpoint - builds user profile through conversation
    Uses AI for natural language understanding while maintaining quiz flow
    """
    correlation_id = req.headers.get('X-Correlation-ID')
    log = get_logger(correlation_id)
    
    try:
        log.info(f"📋 Twin chat request with {len(request.messages)} messages")
        
        # Determine current step based on message count
        step = get_current_step(request.messages, request.cv_context, request.focus)
        log.info(f"📍 Current step: {STEPS[step]} (step {step})")
        
        # Extract user's last message if any
        user_messages = [m for m in request.messages if m.role == "user"]
        last_user_message = user_messages[-1].content if user_messages else ""
        
        # If AI is enabled, use it to understand unclear answers
        if ai_client.enabled and last_user_message:
            try:
                # Check if the answer matches expected options
                if step > 0 and step < 8:  # For steps with options
                    expected_options = get_options_for_step(step)
                    
                    # Use AI to understand if the answer matches any option
                    understanding_prompt = f"""
                    The user was asked: {get_question_for_step(step)}
                    The user responded: "{last_user_message}"
                    
                    Expected options: {', '.join(expected_options) if expected_options else 'None'}
                    
                    Task:
                    1. If their answer clearly matches one of the options, return that option exactly
                    2. If their answer is unclear but related, choose the closest matching option
                    3. If their answer is completely off-topic, respond with "UNCLEAR"
                    
                    Return only the matched option or "UNCLEAR".
                    """
                    
                    understanding = await ai_client.generate_text_async(
                        prompt=understanding_prompt,
                        system_prompt="You are an AI assistant that helps understand user responses in a career quiz.",
                        temperature=0.3,
                        max_tokens=50,
                        correlation_id=correlation_id
                    )
                    
                    if understanding and understanding.strip() not in ["UNCLEAR", "unclear"]:
                        # User's answer was understood, proceed with next step
                        log.info(f"✅ AI understood answer: {understanding}")
                        # We'll still use the step response but can note the understanding
                
            except Exception as e:
                log.error(f"❌ AI understanding error: {e}")
                # Continue with normal flow
        
        # Generate response based on step
        response = generate_step_response(request.messages, step, request.cv_context, request.focus)
        return ChatResponse(**response)
        
    except Exception as e:
        log.error(f"❌ Error in chat_twin: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.options("/chat/twin")
async def options_twin():
    """CORS preflight"""
    return {"message": "OK"}

@router.post("/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest, req: Request):
    """
    General chat endpoint for non-twin conversations
    Uses AI for intelligent responses
    """
    correlation_id = req.headers.get('X-Correlation-ID')
    log = get_logger(correlation_id)
    
    try:
        log.info(f"💬 General chat request with {len(request.messages)} messages")
        
        if ai_client.enabled:
            try:
                # Use AI for general chat
                system_prompt = """You are a helpful career assistant for South African job seekers.
                Provide concise, practical advice about CV writing, interview preparation, 
                career paths, skills development, and the South African job market.
                Keep responses friendly and encouraging."""
                
                response_text = await ai_client.generate_text_async(
                    prompt=request.messages[-1].content if request.messages else "",
                    system_prompt=system_prompt,
                    temperature=0.7,
                    max_tokens=300,
                    correlation_id=correlation_id
                )
                
                if response_text:
                    return ChatResponse(
                        reply=response_text,
                        options=None,
                        isComplete=False,
                        profile=None
                    )
            except Exception as e:
                log.error(f"❌ AI chat error: {e}")
        
        # Fallback response
        return ChatResponse(
            reply="I'm here to help with your career questions. What would you like to know? You can ask me about CV tips, interview preparation, or career paths in South Africa.",
            options=["CV tips", "Interview help", "Career paths", "Skills advice"],
            isComplete=False,
            profile=None
        )
        
    except Exception as e:
        log.error(f"❌ Error in chat_endpoint: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/chat/health")
async def chat_health():
    """Health check for chat service"""
    return {
        "status": "ok",
        "service": "chat",
        "ai_enabled": ai_client.enabled,
        "mode": "hybrid",
        "timestamp": __import__('datetime').datetime.now().isoformat()
    }

def get_current_step(messages: List[ChatMessage], cv_context: Optional[Dict[str, Any]] = None, focus: Optional[str] = None) -> int:
    """
    Determine current step based on message history
    Intelligently skips steps if info is already in CV
    """
    user_messages = [m for m in messages if m.role == "user"]
    user_count = len(user_messages)
    
    # Aggressive skipping: If we have CV data and this is the start
    if cv_context and user_count == 0:
        sections = cv_context.get('sections', {})
        has_name = bool(cv_context.get('name'))
        # Check if skills exist or if there is substantial CV text to extract from
        has_skills = bool(sections.get('skills')) or len(cv_context.get('cvText', '')) > 500
        
        if has_name and has_skills:
            # Skip name (0), career_stage (1) and go to province (2)
            # The AI prompt handles the "acknowledge" part via the system prompt
            return 2

    # Step mapping based on user message count
    if user_count == 0:
        return 0  # greeting
    elif user_count == 1:
        return 1  # name received, ask career stage
    elif user_count == 2:
        return 2  # career stage received, ask province
    elif user_count == 3:
        return 3  # province received, ask industry
    elif user_count == 4:
        return 4  # industry received, ask education
    elif user_count == 5:
        return 5  # education received, ask skills
    elif user_count == 6:
        return 6  # skills received, ask challenges
    elif user_count == 7:
        return 7  # challenges received, ask goals
    elif user_count >= 8:
        return 8  # goals received, complete profile
    else:
        return 0

def get_options_for_step(step: int) -> Optional[List[str]]:
    """Get options for a given step"""
    options_map = {
        1: ["Early Career (0-3 yrs)", "Mid Career (3-7 yrs)", "Established (7+ yrs)"],
        2: ["Gauteng", "Western Cape", "KwaZulu-Natal", "Other"],
        3: ["Information Technology (IT)", "Finance & Accounting", "Engineering", "Healthcare", "Retail & Sales", "Administration"],
        4: ["Matric", "Diploma", "Bachelor's Degree", "Postgraduate Degree", "Certificate"],
        5: ["Basic Coding (HTML/CSS/Python)", "Customer Service", "Sales", "Administration", "Data Analysis", "Project Management", "Communication", "Leadership"],
        6: ["Finding entry-level roles", "Lack of experience", "Need more qualifications", "Competition is too high", "Don't know where to start"],
        7: ["Find a full-time job", "Get a learnership/internship", "Study further", "Start my own business", "Get certified in my field"],
    }
    return options_map.get(step)

def get_question_for_step(step: int) -> str:
    """Get the question for a given step"""
    questions = {
        0: "What's your name?",
        1: "Which stage best describes you?",
        2: "Which province are you based in?",
        3: "What field or industry interests you most?",
        4: "What's your highest qualification?",
        5: "Which skills do you already have?",
        6: "What's your biggest career challenge right now?",
        7: "What's your main career goal for the next year?",
    }
    return questions.get(step, "")

def generate_step_response(messages: List[ChatMessage], step: int, cv_context: Optional[Dict[str, Any]] = None, focus: Optional[str] = None) -> Dict[str, Any]:
    """
    Generate response based on current step
    """
    user_messages = [m for m in messages if m.role == "user"]
    user_count = len(user_messages)
    
    # Focus-specific starter mapping
    starters = {
        "growth": "Let's focus on scaling your current potential.",
        "switch": "Let's map out your transition to a new field.",
        "startup": "Let's build a profile geared toward the SA startup ecosystem.",
        "corporate": "Let's optimize your profile for SA's top corporate entities."
    }
    focus_note = starters.get(focus, "")

    # Fallback Skill Extraction
    extracted_skills = []
    if cv_context:
        extracted_skills = cv_context.get('sections', {}).get('skills', [])
        if not extracted_skills and cv_context.get('cvText'):
            # Aggressive fallback: basic regex extraction if structured data is missing
            text = cv_context.get('cvText').lower()
            tech_keywords = ['python', 'javascript', 'react', 'node', 'sales', 'retail', 'management']
            extracted_skills = [k.capitalize() for k in tech_keywords if k in text]
    
    # Extract name if available
    name = "there"
    if user_count >= 1:
        name = user_messages[0].content.strip()
        # Clean up name (remove punctuation)
        name = re.sub(r'[^\w\s]', '', name)
        if not name:
            name = "there"
    
    logger.info(f"📝 Step {step} - User count: {user_count}, Name: {name}")
    
    # STEP 0: GREETING - Ask for name
    if step == 0:
        trend = random.choice(TRENDS)
        personalization = ""
        if extracted_skills:
            personalization = f"I've already spotted your background in {', '.join(extracted_skills[:3])}. {focus_note} "

        return {
            "reply": f"Sharp shooter! 🌟 {personalization}{trend}\n\nTo get started, what is your name?",
            "options": None,
            "isComplete": False,
            "profile": None
        }
    
    # STEP 1: After name - Ask career stage with options
    elif step == 1:
        return {
            "reply": f"Hi {name}! 👋 Which stage best describes you?\n\n[OPTIONS: \"Early Career (0-3 yrs)\", \"Mid Career (3-7 yrs)\", \"Established (7+ yrs)\"]",
            "options": ["Early Career (0-3 yrs)", "Mid Career (3-7 yrs)", "Established (7+ yrs)"],
            "isComplete": False,
            "profile": None
        }
    
    # STEP 2: After career stage - Ask province with options
    elif step == 2:
        return {
            "reply": "Which province are you based in? This helps me find opportunities near you.\n\n[OPTIONS: \"Gauteng\", \"Western Cape\", \"KwaZulu-Natal\", \"Other\"]",
            "options": ["Gauteng", "Western Cape", "KwaZulu-Natal", "Other"],
            "isComplete": False,
            "profile": None
        }
    
    # STEP 3: After province - Ask industry with options
    elif step == 3:
        return {
            "reply": "What field or industry interests you most?\n\n[OPTIONS: \"Information Technology (IT)\", \"Finance & Accounting\", \"Engineering\", \"Healthcare\", \"Retail & Sales\", \"Administration\"]",
            "options": ["Information Technology (IT)", "Finance & Accounting", "Engineering", "Healthcare", "Retail & Sales", "Administration"],
            "isComplete": False,
            "profile": None
        }
    
    # STEP 4: After industry - Ask education with options
    elif step == 4:
        return {
            "reply": "What's your highest qualification?\n\n[OPTIONS: \"Matric\", \"Diploma\", \"Bachelor's Degree\", \"Postgraduate Degree\", \"Certificate\"]",
            "options": ["Matric", "Diploma", "Bachelor's Degree", "Postgraduate Degree", "Certificate"],
            "isComplete": False,
            "profile": None
        }
    
    # STEP 5: After education - Ask skills with options
    elif step == 5:
        return {
            "reply": "Which skills do you already have? (You can select multiple)\n\n[OPTIONS: \"Basic Coding (HTML/CSS/Python)\", \"Customer Service\", \"Sales\", \"Administration\", \"Data Analysis\", \"Project Management\", \"Communication\", \"Leadership\"]",
            "options": ["Basic Coding (HTML/CSS/Python)", "Customer Service", "Sales", "Administration", "Data Analysis", "Project Management", "Communication", "Leadership"],
            "isComplete": False,
            "profile": None
        }
    
    # STEP 6: After skills - Ask challenges with options
    elif step == 6:
        return {
            "reply": "What's your biggest career challenge right now?\n\n[OPTIONS: \"Finding entry-level roles\", \"Lack of experience\", \"Need more qualifications\", \"Competition is too high\", \"Don't know where to start\"]",
            "options": ["Finding entry-level roles", "Lack of experience", "Need more qualifications", "Competition is too high", "Don't know where to start"],
            "isComplete": False,
            "profile": None
        }
    
    # STEP 7: After challenges - Ask goals with options
    elif step == 7:
        return {
            "reply": "What's your main career goal for the next year?\n\n[OPTIONS: \"Find a full-time job\", \"Get a learnership/internship\", \"Study further\", \"Start my own business\", \"Get certified in my field\"]",
            "options": ["Find a full-time job", "Get a learnership/internship", "Study further", "Start my own business", "Get certified in my field"],
            "isComplete": False,
            "profile": None
        }
    
    # STEP 8: After goals - Build and return profile
    else:
        # Build profile from all answers
        profile = build_profile_from_conversation(messages)
        
        return {
            "reply": f"🎉 Great! I've built your Digital Twin profile. Your empowerment score is **{profile['empowermentScore']}/100**, which shows you have strong potential in the SA job market!\n\nHere's your profile summary:\n- **Name:** {profile['name']}\n- **Career Stage:** {profile['careerStage']}\n- **Province:** {profile['province']}\n- **Industry:** {profile['industry']}\n- **Education:** {profile['education']}\n- **Skills:** {', '.join(profile['skills'])}\n- **Challenge:** {profile['challenges']}\n- **Goal:** {profile['goals']}\n\n[COMPLETE]\n[PROFILE: {json.dumps(profile)}]",
            "options": None,
            "isComplete": True,
            "profile": profile
        }

def build_profile_from_conversation(messages: List[ChatMessage]) -> Dict[str, Any]:
    """
    Extract profile data from conversation history
    """
    user_messages = [m for m in messages if m.role == "user"]
    
    # Default values
    profile = {
        "name": "User",
        "careerStage": "Early Career",
        "province": "Gauteng",
        "industry": "Information Technology",
        "education": "Bachelor's Degree",
        "skills": ["Communication", "Problem Solving"],
        "challenges": "Finding entry-level roles",
        "goals": "Find a full-time job"
    }
    
    # Extract from messages if available
    if len(user_messages) >= 1:
        profile["name"] = user_messages[0].content.strip()
    
    if len(user_messages) >= 2:
        career = user_messages[1].content
        if "Early" in career:
            profile["careerStage"] = "Early Career"
        elif "Mid" in career:
            profile["careerStage"] = "Mid Career"
        elif "Established" in career:
            profile["careerStage"] = "Established"
    
    if len(user_messages) >= 3:
        province = user_messages[2].content
        if "Gauteng" in province:
            profile["province"] = "Gauteng"
        elif "Cape" in province:
            profile["province"] = "Western Cape"
        elif "Natal" in province:
            profile["province"] = "KwaZulu-Natal"
        else:
            profile["province"] = province
    
    if len(user_messages) >= 4:
        industry = user_messages[3].content
        if "IT" in industry or "Technology" in industry:
            profile["industry"] = "Information Technology"
        elif "Finance" in industry:
            profile["industry"] = "Finance & Accounting"
        elif "Engineering" in industry:
            profile["industry"] = "Engineering"
        elif "Healthcare" in industry:
            profile["industry"] = "Healthcare"
        elif "Retail" in industry:
            profile["industry"] = "Retail & Sales"
        elif "Administration" in industry:
            profile["industry"] = "Administration"
        else:
            profile["industry"] = industry
    
    if len(user_messages) >= 5:
        edu = user_messages[4].content
        if "Matric" in edu:
            profile["education"] = "Matric"
        elif "Diploma" in edu:
            profile["education"] = "Diploma"
        elif "Degree" in edu:
            profile["education"] = "Bachelor's Degree"
        elif "Postgraduate" in edu:
            profile["education"] = "Postgraduate Degree"
        elif "Certificate" in edu:
            profile["education"] = "Certificate"
    
    if len(user_messages) >= 6:
        skills_text = user_messages[5].content
        # Extract skills from the response
        skill_keywords = ["Coding", "Customer Service", "Sales", "Administration", 
                         "Data Analysis", "Project Management", "Communication", "Leadership"]
        skills = []
        for skill in skill_keywords:
            if skill.lower() in skills_text.lower():
                skills.append(skill)
        if skills:
            profile["skills"] = skills
    
    if len(user_messages) >= 7:
        profile["challenges"] = user_messages[6].content
    
    if len(user_messages) >= 8:
        goals_text = user_messages[7].content
        if "job" in goals_text.lower():
            profile["goals"] = "Find a full-time job"
        elif "learnership" in goals_text.lower() or "internship" in goals_text.lower():
            profile["goals"] = "Get a learnership/internship"
        elif "study" in goals_text.lower() or "further" in goals_text.lower():
            profile["goals"] = "Study further"
        elif "business" in goals_text.lower():
            profile["goals"] = "Start my own business"
        elif "certified" in goals_text.lower():
            profile["goals"] = "Get certified in my field"
    
    # Calculate empowerment score
    score = calculate_empowerment_score(profile)
    profile["empowermentScore"] = score
    
    return profile

def calculate_empowerment_score(profile: Dict[str, Any]) -> int:
    """
    Calculate empowerment score based on profile data
    """
    score = 40  # Base score
    
    # Education points (up to 20)
    edu = profile.get("education", "")
    if "Postgraduate" in edu:
        score += 20
    elif "Bachelor" in edu or "Degree" in edu:
        score += 15
    elif "Diploma" in edu:
        score += 10
    elif "Certificate" in edu:
        score += 5
    
    # Career stage points (up to 15)
    stage = profile.get("careerStage", "")
    if "Established" in stage:
        score += 15
    elif "Mid" in stage:
        score += 10
    elif "Early" in stage:
        score += 5
    
    # Skills points (up to 15)
    skills = profile.get("skills", [])
    score += min(len(skills) * 3, 15)
    
    # Goals points (up to 10)
    goals = profile.get("goals", "")
    if goals and goals not in ["Find a full-time job", "Get a learnership/internship"]:
        score += 10
    else:
        score += 5
    
    return min(score, 100)