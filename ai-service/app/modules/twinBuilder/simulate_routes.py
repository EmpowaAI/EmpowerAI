from fastapi import APIRouter

from app.modules.twinBuilder.service import TwinBuilderService
from app.utils.logger import logger

router = APIRouter()

twin_builder_service = TwinBuilderService()


# ── POST /simulate ── (root-level path, matches backend contract)
@router.post("/simulate")
async def simulate(payload: dict):
    logger.info("TWIN_SIMULATE_ROUTE")
    return twin_builder_service.simulate(payload)
