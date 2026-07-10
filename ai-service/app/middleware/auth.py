import secrets

from fastapi import Request, HTTPException

from app.config.config import settings


def _valid_tokens() -> list[str]:
    """Tokens accepted from callers. SERVICE_SECRET is canonical;
    AI_SERVICE_API_KEY is accepted for backward compatibility with
    backends configured against the older variable name."""
    tokens = []
    if settings.SERVICE_SECRET:
        tokens.append(settings.SERVICE_SECRET)
    if settings.AI_SERVICE_API_KEY:
        tokens.append(settings.AI_SERVICE_API_KEY)
    return tokens


def is_authorized(token: str | None) -> bool:
    if not token:
        return False
    return any(secrets.compare_digest(token, valid) for valid in _valid_tokens())


async def verify_service_token(request: Request):
    token = request.headers.get("X-Service-Token")
    if not is_authorized(token):
        raise HTTPException(status_code=401, detail="Unauthorized")
    return True
