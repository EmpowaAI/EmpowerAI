from fastapi import APIRouter

from app.modules.interview.service import InterviewService
from app.utils.logger import logger

router = APIRouter()

interview_service = InterviewService()


# Sync `def` - the OpenAI SDK call inside is blocking; FastAPI runs plain
# def handlers in a threadpool so the event loop stays free.
# ── POST /interview/start ──
@router.post("/start")
def start_interview(payload: dict):
    logger.info("INTERVIEW_START_REQUEST")
    return interview_service.start(payload)


# ── POST /interview/answer ──
@router.post("/answer")
def submit_answer(payload: dict):
    logger.info("INTERVIEW_ANSWER_REQUEST")
    return interview_service.answer(payload)
