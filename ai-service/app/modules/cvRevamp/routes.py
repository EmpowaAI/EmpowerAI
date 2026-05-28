from fastapi import APIRouter
from app.modules.cvRevamp.service import CVRevampService
from app.core.exceptions import AIServiceError
from app.utils.logger import logger

router = APIRouter()

cv_revamp_service = CVRevampService()


@router.post("/")
async def revamp_cv(payload: dict):
    try:
        logger.info("CV_REVAMP_REQUEST")

        result = cv_revamp_service.revamp(payload)
        return result

    except AIServiceError as e:
        logger.warning(f"CV_REVAMP_ERROR | {e}")
        return {"success": False, "error": e.message}

    except Exception as e:
        logger.error(f"CV_REVAMP_UNHANDLED | {str(e)}")
        return {"success": False, "error": "Internal server error"}