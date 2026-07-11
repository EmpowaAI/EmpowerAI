from fastapi import APIRouter

from app.modules.twinBuilder.service import TwinBuilderService
from app.utils.logger import logger

router = APIRouter()

twin_builder_service = TwinBuilderService()


# Sync `def` — blocking OpenAI SDK call runs in the threadpool.
# ── POST /twin/generate ──
@router.post("/generate")
def generate_twin(payload: dict):
    logger.info("TWIN_GENERATE_ROUTE")
    return twin_builder_service.generate(payload)
