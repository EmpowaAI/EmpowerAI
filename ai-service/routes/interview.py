"""
FastAPI routes for Interview Coach
"""

from fastapi import APIRouter, HTTPException
from datetime import datetime, timedelta
from models.schemas import (
    InterviewStartRequest,
    InterviewSessionResponse,
    InterviewAnswerRequest,
    InterviewFeedback
)
from services.interview_coach import InterviewCoach

router = APIRouter()
interview_coach = InterviewCoach()

# Store sessions in memory (in production, use Redis or database)
# Sessions expire after 1 hour of inactivity
sessions = {}
SESSION_EXPIRY_HOURS = 1

def cleanup_expired_sessions():
    """Remove sessions older than SESSION_EXPIRY_HOURS"""
    now = datetime.now()
    expired_keys = []
    
    for session_id, session in sessions.items():
        # Check if session has a timestamp
        if 'createdAt' in session:
            session_age = now - session['createdAt']
            if session_age > timedelta(hours=SESSION_EXPIRY_HOURS):
                expired_keys.append(session_id)
        # If no timestamp, assume it's old and remove it
        else:
            expired_keys.append(session_id)
    
    for key in expired_keys:
        del sessions[key]
    
    if expired_keys:
        print(f"Cleaned up {len(expired_keys)} expired interview session(s)")

@router.post("/start", response_model=InterviewSessionResponse)
async def start_interview(request: InterviewStartRequest):
    """
    Start a new interview session
    """
    try:
        # Clean up expired sessions before creating new one
        cleanup_expired_sessions()
        
        session = interview_coach.start_session(
            request.type,
            request.difficulty,
            request.company
        )
        # Add timestamp for expiry tracking
        session['createdAt'] = datetime.now()
        sessions[session['sessionId']] = session
        return InterviewSessionResponse(**session)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error starting interview: {str(e)}")

@router.post("/{session_id}/answer", response_model=InterviewFeedback)
async def submit_answer(session_id: str, answer: InterviewAnswerRequest):
    """
    Submit an answer to an interview question and get feedback
    """
    try:
        # Clean up expired sessions
        cleanup_expired_sessions()
        
        if session_id not in sessions:
            raise HTTPException(status_code=404, detail="Session not found or expired")
        
        session = sessions[session_id]
        questions = session['questions']
        
        # Find the question - check both 'question' and 'text' fields for compatibility
        question = None
        for q in questions:
            if q.get('id') == answer.questionId or q.get('id') == answer.questionId:
                question = q
                break
        
        if not question:
            raise HTTPException(status_code=404, detail="Question not found")
        
        # Normalize question format for evaluation
        question_text = question.get('text') or question.get('question') or ''
        question_for_eval = {
            'id': question.get('id'),
            'question': question_text,
            'type': question.get('type', 'general'),
            'difficulty': question.get('difficulty', 'medium')
        }
        
        # Evaluate response
        feedback_data = interview_coach.evaluate_response(question_for_eval, answer.response)
        
        # Store feedback in session
        session['feedback'].append(feedback_data)
        
        return InterviewFeedback(**feedback_data)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error evaluating answer: {str(e)}")

@router.get("/{session_id}")
async def get_session(session_id: str):
    """Get interview session details"""
    cleanup_expired_sessions()
    
    if session_id not in sessions:
        raise HTTPException(status_code=404, detail="Session not found or expired")
    return sessions[session_id]

@router.get("/health")
async def health_check():
    """Health check for interview coach service"""
    return {"status": "ok", "service": "interview_coach"}

