from fastapi import Request, HTTPException, Depends
from app.config.config import settings


async def verify_service_token(request: Request):
    token = request.headers.get("X-Service-Token")

    if not token or token != settings.SERVICE_SECRET:
        raise HTTPException(status_code=401, detail="Unauthorized")

    return True