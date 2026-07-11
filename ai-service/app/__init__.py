from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware

from datetime import datetime
import time
import uuid

from app.utils.logger import get_logger
from app.config.config import settings
from app.core.exceptions import AIServiceError
from app.middleware.auth import is_authorized

logger = get_logger()

# Paths that must stay reachable without a service token
PUBLIC_PATHS = {"/", "/health", "/docs", "/redoc", "/openapi.json"}

# Cached Azure OpenAI status so /health can report openai_status without
# calling Azure on every poll. Refreshed at most once per TTL; always
# non-fatal (a failing check reports "failed" but /health still returns 200,
# so a transient Azure blip never makes Render restart the service).
_OPENAI_HEALTH_TTL = 300.0
_openai_health = {"status": "unknown", "checked_at": 0.0}


def _get_openai_status() -> str:
    now = time.monotonic()
    if _openai_health["status"] == "unknown" or (now - _openai_health["checked_at"]) > _OPENAI_HEALTH_TTL:
        try:
            from app.core.aiClient import AIClient
            _openai_health["status"] = "ok" if AIClient().ping() else "failed"
        except Exception:
            _openai_health["status"] = "failed"
        _openai_health["checked_at"] = now
    return _openai_health["status"]


def create_app() -> FastAPI:
    logger.info("Initializing EmpowerAI AI Service...")

    app = FastAPI(
        title="EmpowerAI AI Service",
        version="1.0.0",
        docs_url="/docs",
        redoc_url="/redoc"
    )

    # ── CORS ─────────────────────────────────────────────
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.ALLOWED_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # ── Correlation ID Middleware ───────────────────────
    class CorrelationIDMiddleware(BaseHTTPMiddleware):

        async def dispatch(self, request: Request, call_next):
            correlation_id = (
                request.headers.get("X-Correlation-ID")
                or str(uuid.uuid4())
            )

            request.state.correlation_id = correlation_id

            response = await call_next(request)

            response.headers["X-Correlation-ID"] = correlation_id

            return response

    app.add_middleware(CorrelationIDMiddleware)

    # ── Service Token Auth ──────────────────────────────
    # Every business endpoint requires X-Service-Token. Only health
    # checks and API docs are public. Applies to current AND future
    # routers automatically.
    class ServiceAuthMiddleware(BaseHTTPMiddleware):

        async def dispatch(self, request: Request, call_next):
            path = request.url.path.rstrip("/") or "/"

            if request.method == "OPTIONS" or path in PUBLIC_PATHS:
                return await call_next(request)

            if not is_authorized(request.headers.get("X-Service-Token")):
                logger.warning(f"AUTH_REJECTED | path={path}")
                return JSONResponse(
                    status_code=401,
                    content={"detail": "Unauthorized"},
                )

            return await call_next(request)

    app.add_middleware(ServiceAuthMiddleware)

    # ── Domain Error Handler ────────────────────────────
    @app.exception_handler(AIServiceError)
    async def ai_service_error_handler(request: Request, exc: AIServiceError):
        logger.error(f"AI_SERVICE_ERROR | path={request.url.path} | {exc.message}")
        return JSONResponse(status_code=exc.status_code, content=exc.to_dict())

    # ── Health Routes ───────────────────────────────────
    @app.get("/")
    async def root():
        return {
            "status": "ok",
            "service": "EmpowerAI AI Service",
            "timestamp": datetime.now().isoformat(),
        }

    # Sync `def` so the (cached, occasional) Azure ping runs in the
    # threadpool. openai_status lets the backend and operators see whether
    # Azure is actually reachable instead of a permanent "unknown".
    @app.get("/health")
    def health():
        return {
            "status": "healthy",
            "openai_status": _get_openai_status(),
            "timestamp": datetime.now().isoformat(),
        }

    # ── Register Routers ────────────────────────────────
    from app.modules.cvAnalyser.routes import (
        router as cv_analyzer_router,
    )

    from app.modules.cvRevamp.routes import (
        router as cv_revamp_router,
    )

    from app.modules.interview.routes import (
        router as interview_router,
    )

    from app.modules.twinChat.routes import (
        router as twin_chat_router,
    )

    from app.modules.twinBuilder.routes import (
        router as twin_builder_router,
    )

    from app.modules.twinBuilder.simulate_routes import (
        router as simulate_router,
    )

    app.include_router(
        cv_analyzer_router,
        prefix="/api/cv",
        tags=["CV Analyzer"],
    )
    app.include_router(
        cv_revamp_router,
        prefix="/api/cv/revamp",
        tags=["CV Revamp"],
    )
    app.include_router(
        interview_router,
        prefix="/interview",
        tags=["Interview Coach"],
    )
    app.include_router(
        twin_chat_router,
        prefix="/chat",
        tags=["Twin Chat"],
    )
    app.include_router(
        twin_builder_router,
        prefix="/twin",
        tags=["Twin Builder"],
    )
    app.include_router(
        simulate_router,
        tags=["Twin Builder"],
    )

    logger.info("App initialized successfully")

    return app
