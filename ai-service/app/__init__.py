from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware

from datetime import datetime
import uuid

from app.utils.logger import get_logger
from app.config.config import settings

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

    logger.info("App initialized successfully")

    return app