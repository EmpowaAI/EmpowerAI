from fastapi import APIRouter

from app.modules.twinChat.service import TwinChatService
from app.utils.logger import logger

router = APIRouter()

twin_chat_service = TwinChatService()


# Sync `def` - blocking OpenAI SDK call runs in the threadpool.
# ── POST /chat/twin ──
@router.post("/twin")
def chat_twin(payload: dict):
    logger.info("TWIN_CHAT_ROUTE")
    return twin_chat_service.chat(payload)
