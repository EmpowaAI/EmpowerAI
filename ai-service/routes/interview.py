"""
FastAPI routes for Interview Coach
"""

from fastapi import APIRouter, HTTPException
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
sessions = {}

@router.post("/start", response_model=InterviewSessionResponse)
async def start_interview(request: InterviewStartRequest):
    """
    Start a new interview session
    """
    try:
        session = interview_coach.start_session(
            request.type,
            request.difficulty,
            request.company
        )
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
        if session_id not in sessions:
            raise HTTPException(status_code=404, detail="Session not found")
        
        session = sessions[session_id]
        questions = session['questions']
        
        # Find the question
        question = None
        for q in questions:
            if q['id'] == answer.questionId:
                question = q
                break
        
        if not question:
            raise HTTPException(status_code=404, detail="Question not found")
        
        # Evaluate response
        feedback_data = interview_coach.evaluate_response(question, answer.response)
        
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
    if session_id not in sessions:
        raise HTTPException(status_code=404, detail="Session not found")
    return sessions[session_id]

@router.get("/health")
async def health_check():
    """Health check for interview coach service"""
    return {"status": "ok", "service": "interview_coach"}

