from fastapi import APIRouter
from app.modules.cvRevamp.service import CVRevampService
from app.core.exceptions import AIServiceError
from app.utils.logger import logger

router = APIRouter()

cv_revamp_service = CVRevampService()


# Sync `def` so FastAPI runs this in the threadpool — the OpenAI SDK call
# inside is blocking and would otherwise stall the event loop.
@router.post("/")
def revamp_cv(payload: dict):
    logger.info("CV_REVAMP_REQUEST")
    # Let AIServiceError (and its subclasses) propagate to the global handler
    # so failures return a proper non-2xx status. Returning 200 here caused
    # the backend to persist an empty revamp and report success to the user.
    return cv_revamp_service.revamp(payload)
