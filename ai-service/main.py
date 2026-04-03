"""
EmpowerAI AI Service
FastAPI service for Digital Twin generation, simulations, and AI features
"""

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from dotenv import load_dotenv
import os
import uuid
from datetime import datetime
import sys

# Add the current directory to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from utils.logger import get_logger

load_dotenv()

logger = get_logger()
logger.info("Starting EmpowerAI AI Service...")

print("=" * 50)
print(f"AZURE_OPENAI_ENDPOINT: {os.getenv('AZURE_OPENAI_ENDPOINT')}")
print(f"AZURE_OPENAI_MODEL: {os.getenv('AZURE_OPENAI_MODEL')}")
print(f"PORT: {os.getenv('PORT', '8000')}")
print("=" * 50)

app = FastAPI(
    title="EmpowerAI AI Service",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Correlation ID middleware
class CorrelationIDMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        correlation_id = request.headers.get('X-Correlation-ID') or str(uuid.uuid4())
        request.state.correlation_id = correlation_id
        response = await call_next(request)
        response.headers['X-Correlation-ID'] = correlation_id
        return response

app.add_middleware(CorrelationIDMiddleware)

# Optional API key protection for internal routes
def _is_truthy(value: str | None) -> bool:
    if value is None:
        return False
    return value.strip().lower() in ("1", "true", "yes", "y", "on")

REQUIRE_AI_SERVICE_API_KEY = _is_truthy(os.getenv("REQUIRE_AI_SERVICE_API_KEY"))
AI_SERVICE_API_KEY = os.getenv("AI_SERVICE_API_KEY")

if REQUIRE_AI_SERVICE_API_KEY and not AI_SERVICE_API_KEY:
    raise RuntimeError(
        "AI_SERVICE_API_KEY must be set when REQUIRE_AI_SERVICE_API_KEY=true"
    )

@app.middleware("http")
async def api_key_guard(request: Request, call_next):
    if AI_SERVICE_API_KEY:
        path = request.url.path
        is_public = (
            path == "/" or
            path == "/health" or
            path.endswith("/health") or
            path.startswith("/docs") or
            path.startswith("/redoc") or
            path.startswith("/openapi")
        )
        is_protected = path.startswith("/api") or path.startswith("/debug")
        if is_protected and not is_public:
            provided = request.headers.get("X-API-KEY")
            if provided != AI_SERVICE_API_KEY:
                return JSONResponse(status_code=401, content={"detail": "Unauthorized"})
    return await call_next(request)

# CORS configuration
allowed_origins = [
    "http://localhost:3000",
    "http://localhost:5000",
    "http://localhost:5173",
    "http://localhost:5174",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5000",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5174",
]

if os.getenv("FRONTEND_URL"):
    allowed_origins.append(os.getenv("FRONTEND_URL").rstrip('/'))

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

@app.middleware("http")
async def log_requests(request: Request, call_next):
    path = request.url.path
    if request.method != "OPTIONS" and not path.startswith("/docs") and not path.startswith("/redoc") and not path.startswith("/openapi"):
        logger.info(f"Request: {request.method} {path}")
    response = await call_next(request)
    return response

@app.get("/")
async def root():
    return {
        "status": "ok",
        "message": "EmpowerAI AI Service is running",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/health",
        "endpoints": {
            "cv_analyze": "/api/cv/analyze",
            "cv_analyze_file": "/api/cv/analyze-file",
            "cv_revamp": "/api/cv/revamp",
            "digital_twin": "/api/twin/generate",
            "digital_twin_get": "/api/twin/my-twin",
            "simulation": "/api/simulation",
            "interview": "/api/interview",
            "chat": "/api/chat",
            "chat_twin": "/api/chat/twin"
        }
    }

@app.get("/health")
async def health_check(request: Request):
    """Fast health check - doesn't recreate AIClient"""
    from utils.ai_client import AIClient
    
    # This will reuse the singleton instance
    ai_client = AIClient()
    
    return {
        "status": "healthy",
        "service": "EmpowerAI AI Service",
        "openai_status": "enabled" if ai_client.enabled else "disabled",
        "timestamp": datetime.now().isoformat(),
    }

@app.get("/debug/connection")
async def debug_connection():
    """Debug endpoint - also uses singleton"""
    from utils.ai_client import AIClient
    
    ai_client = AIClient()
    
    return {
        "status": "ok",
        "connected": True,
        "ai_client_enabled": ai_client.enabled,
        "use_azure": ai_client.use_azure,
        "model": ai_client.model if hasattr(ai_client, 'model') else None,
        "timestamp": datetime.now().isoformat()
    }

# Import all routes - FIXED: Removed duplicate chat import
from routes import digital_twin, simulation, cv_analysis, cv_analysis_file, cv_revamp, interview, chat, twin

# Include all routers with proper prefixes
app.include_router(digital_twin.router, prefix="/api")
app.include_router(simulation.router, prefix="/api")
app.include_router(cv_analysis.router, prefix="/api/cv")
app.include_router(cv_analysis_file.router, prefix="/api/cv")
app.include_router(cv_revamp.router, prefix="/api/cv")
app.include_router(interview.router, prefix="/api")
app.include_router(chat.router, prefix="/api")  # Single chat router (AI-powered)
app.include_router(twin.router, prefix="/api")  # New twin router for /api/twin/* endpoints

# Print all registered routes for debugging
logger.info("=== Registered Routes ===")
for route in app.routes:
    if hasattr(route, "path"):
        logger.info(f"  {route.path}")
logger.info("========================")

@app.exception_handler(404)
async def custom_404_handler(request: Request, exc):
    logger.warning(f"404 Not Found: {request.method} {request.url.path}")
    return JSONResponse(
        status_code=404,
        content={
            "detail": "Endpoint not found",
            "path": request.url.path,
            "method": request.method
        }
    )

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port, log_level="info")
