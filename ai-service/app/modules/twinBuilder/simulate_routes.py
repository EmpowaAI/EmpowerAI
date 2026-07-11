from fastapi import APIRouter

from app.modules.twinBuilder.service import TwinBuilderService
from app.utils.logger import logger

router = APIRouter()

twin_builder_service = TwinBuilderService()


# Sync `def` — blocking OpenAI SDK call runs in the threadpool.
# ── POST /simulate ── (root-level path, matches backend contract)
@router.post("/simulate")
def simulate(payload: dict):
    logger.info("TWIN_SIMULATE_ROUTE")
    return twin_builder_service.simulate(payload)
