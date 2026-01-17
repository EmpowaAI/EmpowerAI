from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from utils.ai_client import AIClient

router = APIRouter()
ai_client = AIClient()

class ChatRequest(BaseModel):
    message: str

class ChatResponse(BaseModel):
    reply: str

@router.post("/", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    if not ai_client.enabled:
        raise HTTPException(status_code=503, detail="AI service not configured")
    
    reply = ai_client.chat(request.message)  # Changed from payload.message
    return {"reply": reply}