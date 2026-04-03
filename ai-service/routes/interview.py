"""
FastAPI routes for Interview Coach
"""

from fastapi import APIRouter, HTTPException, Request
from datetime import datetime, timedelta
from models.schemas import (
    InterviewStartRequest,
    InterviewSessionResponse,
    InterviewAnswerRequest,
    InterviewFeedback
)
from services.interview_coach import InterviewCoach
from utils.logger import get_logger
from utils.ai_client import AIClient

router = APIRouter(prefix="/interview", tags=["Interview"])
interview_coach = InterviewCoach()
ai_client = AIClient()  # Get singleton instance

# Store sessions in memory
sessions = {}
SESSION_EXPIRY_HOURS = 1

logger = get_logger()

def cleanup_expired_sessions():
    now = datetime.now()
    expired_keys = []
    
    for session_id, session in sessions.items():
        if 'startedAt' in session and session['startedAt']:
            session_age = now - session['startedAt']
            if session_age > timedelta(hours=SESSION_EXPIRY_HOURS):
                expired_keys.append(session_id)
        else:
            expired_keys.append(session_id)
    
    for key in expired_keys:
        del sessions[key]
    
    if expired_keys:
        logger.info(f"Cleaned up {len(expired_keys)} expired sessions")

@router.post("/start", response_model=InterviewSessionResponse)
async def start_interview(request: InterviewStartRequest, req: Request):
    try:
        cleanup_expired_sessions()
        
        # Log Azure status and CV data
        logger.info(f"Azure OpenAI enabled: {ai_client.enabled}")
        if request.cvData:
            skill_count = len(getattr(request.cvData.sections, 'skills', [])) if request.cvData.sections else 0
            logger.info(f"CV data received with {skill_count} skills")
        else:
            logger.info("No CV data provided for this session")
            
        # Defensive check for job description naming
        job_desc = getattr(request, 'jobDescription', getattr(request, 'job_description', None))
        logger.info(f"Job description status: {'Received' if job_desc else 'Not provided'}")
        
        # Convert CV data to dict for the coach
        cv_data = request.cvData.dict() if request.cvData else None
        
        # AWAIT the async method with job description
        session = await interview_coach.start_session(
            request.type,
            request.difficulty,
            request.company,
            cv_data,  # Pass CV data to coach
            job_desc  # Pass job description to coach
        )
        
        session['startedAt'] = datetime.now()
        sessions[session['sessionId']] = session
        
        logger.info(f"Interview session started: {session['sessionId']} with Azure: {ai_client.enabled}")
        
        return InterviewSessionResponse(**session)
        
    except Exception as e:
        logger.error(f"Error starting interview: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error starting interview: {str(e)}")

@router.post("/answer", response_model=InterviewFeedback)
async def submit_answer(answer: InterviewAnswerRequest, req: Request):
    try:
        cleanup_expired_sessions()
        
        if answer.sessionId not in sessions:
            raise HTTPException(status_code=404, detail="Session not found")
        
        session = sessions[answer.sessionId]
        questions = session['questions']
        
        question = None
        for q in questions:
            if q.get('id') == answer.questionId:
                question = q
                break
        
        if not question:
            raise HTTPException(status_code=404, detail="Question not found")
        
        # Convert CV data to dict if provided
        cv_data = answer.cvData.dict() if answer.cvData else None
        
        # Get job description from session if it exists (for evaluation context)
        job_description = session.get('jobDescription', None)
        
        # Log before evaluation
        logger.info(f"Evaluating answer for question {answer.questionId} with Azure: {ai_client.enabled}")
        if cv_data:
            logger.info(f"CV context provided with {len(cv_data.get('sections', {}).get('skills', []))} skills")
        else:
            logger.info("No CV context for this answer")
        
        # AWAIT the async method with job description
        feedback_data = await interview_coach.evaluate_response(
            question, 
            answer.response, 
            cv_data,
            job_description  # 👈 Pass job description to evaluation
        )
        
        # Log after evaluation
        logger.info(f"Evaluation complete - Score: {feedback_data['score']}, Used Azure: {ai_client.enabled}")
        
        if 'strengths' not in feedback_data:
            feedback_data['strengths'] = []
        if 'improvements' not in feedback_data:
            feedback_data['improvements'] = []
        if 'suggestedAnswer' not in feedback_data:
            feedback_data['suggestedAnswer'] = None
        
        session['feedback'].append(feedback_data)
        
        return InterviewFeedback(**feedback_data)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error evaluating answer: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error evaluating answer: {str(e)}")

@router.get("/{session_id}")
async def get_session(session_id: str, req: Request):
    cleanup_expired_sessions()
    
    if session_id not in sessions:
        raise HTTPException(status_code=404, detail="Session not found")
    
    return sessions[session_id]

@router.get("/health")
async def health_check():
    return {
        "status": "ok", 
        "service": "interview_coach",
        "active_sessions": len(sessions),
        "azure_enabled": ai_client.enabled
    }
