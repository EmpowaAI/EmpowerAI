# `hmac.compare_digest` is used below for a constant-time string check.
# Python's `==` and `!=` on strings stop at the first byte that differs.
# The time to fail then depends on how many leading bytes were correct.
# Over many timed requests, that timing can reveal the secret one byte
# at a time. `compare_digest` always reads both inputs fully and so
# does not have this timing signal.
import hmac

from fastapi import Request, HTTPException, Depends
from app.config.config import settings


async def verify_service_token(request: Request):
    token = request.headers.get("X-Service-Token")

    # Two cases return 401:
    #   1. `not token` -> no header on the request.
    #   2. `not compare_digest(...)` -> header is present but does not match.
    # `compare_digest` is the constant-time check described at the top
    # of this file.
    if not token or not hmac.compare_digest(token, settings.SERVICE_SECRET):
        raise HTTPException(status_code=401, detail="Unauthorized")

    return True