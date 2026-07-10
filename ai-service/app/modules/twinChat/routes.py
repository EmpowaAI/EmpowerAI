from fastapi import APIRouter

from app.modules.twinChat.service import TwinChatService
from app.utils.logger import logger

router = APIRouter()

twin_chat_service = TwinChatService()


# ── POST /chat/twin ──
@router.post("/twin")
async def chat_twin(payload: dict):
    logger.info("TWIN_CHAT_ROUTE")
    return twin_chat_service.chat(payload)
