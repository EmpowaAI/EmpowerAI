from fastapi import FastAPI, Request, Depends
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware

from datetime import datetime
import uuid

from app.utils.logger import get_logger
from app.config.config import settings

# Shared-secret check applied to every CV endpoint below.
# Without this check, anyone can call the public Render URL and consume
# the upstream API quota. Defined in `app/middleware/auth.py`.
from app.middleware.auth import verify_service_token

logger = get_logger()


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

    # ── Health Routes ───────────────────────────────────
    @app.get("/")
    async def root():
        return {
            "status": "ok",
            "service": "EmpowerAI AI Service",
            "timestamp": datetime.now().isoformat(),
        }

    @app.get("/health")
    async def health():
        return {
            "status": "healthy",
            "timestamp": datetime.now().isoformat(),
        }

    # ── Register Routers ────────────────────────────────
    from app.modules.cvAnalyser.routes import (
        router as cv_analyzer_router,
    )

    from app.modules.cvRevamp.routes import (
        router as cv_revamp_router,
    )

    # `dependencies=[Depends(verify_service_token)]` runs the token check
    # before every route in the router. Each route under `/api/cv/...`
    # and `/api/cv/revamp/...` then needs a valid `X-Service-Token`
    # header. If the header is missing or wrong, the request returns
    # 401, the model is not called, and no upstream API quota is used.
    #
    # A router mounted without this `dependencies=` value would be
    # publicly callable.
    app.include_router(
        cv_analyzer_router,
        prefix="/api/cv",
        tags=["CV Analyzer"],
        dependencies=[Depends(verify_service_token)],
    )
    app.include_router(
        cv_revamp_router,
        prefix="/api/cv/revamp",
        tags=["CV Revamp"],
        dependencies=[Depends(verify_service_token)],
    )

    logger.info("App initialized successfully")

    return app