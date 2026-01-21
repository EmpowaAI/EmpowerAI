"""
EmpowerAI AI Service
FastAPI service for Digital Twin generation, simulations, and AI features
"""

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
from dotenv import load_dotenv
import os
import uuid
from datetime import datetime
from utils.logger import get_logger


load_dotenv()
from routes import chat

# DEBUG: Add these lines temporarily
print("=" * 50)
print("DEBUG: Environment Variables")
print(f"OPENAI_API_KEY set: {bool(os.getenv('OPENAI_API_KEY'))}")
print(f"OPENAI_API_KEY length: {len(os.getenv('OPENAI_API_KEY', ''))}")
print(f"OPENAI_MODEL: {os.getenv('OPENAI_MODEL')}")
print(f"Current directory: {os.getcwd()}")
print(f".env exists: {os.path.exists('.env')}")
print("=" * 50)

logger = get_logger()
logger.info("Starting EmpowerAI AI Service...")

app = FastAPI(
    title="EmpowerAI AI Service",
    description="""
    Service for Digital Twin, Simulations, and Analysis.
    
    ## Features
    
    * **Digital Twin Generation** - Create economic twins for users
    * **Path Simulation** - Simulate career paths with income projections
    * **CV Analysis** - Extract skills and provide improvement suggestions
    * **Interview Coach** - Interview practice and feedback
    
    ## Quick Start
    
    All endpoints are under `/api/` prefix.
    
    Visit `/docs` for interactive API documentation.
    """,
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

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5000",
        "http://localhost:5173",
        "https://empower-ai-gamma.vercel.app",
        "https://empowerai.onrender.com",
        os.getenv("FRONTEND_URL", ""),
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    logger.info("Root endpoint accessed")
    return {
        "status": "ok",
        "message": "EmpowerAI AI Service is running",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/health"
    }

@app.get("/health")
async def health_check(request: Request):
    """Health check endpoint with detailed status"""
    correlation_id = request.state.correlation_id
    
    # Check OpenAI connection
    openai_status = "connected"
    try:
        from utils.ai_client import AIClient
        ai_client = AIClient()
        openai_status = "enabled" if ai_client.enabled else "disabled"
    except Exception as e:
        openai_status = f"error: {str(e)}"
    
    return {
        "status": "healthy",
        "service": "EmpowerAI AI Service",
        "version": "1.0.0",
        "openai_status": openai_status,
        "timestamp": datetime.now().isoformat(),
        "correlation_id": correlation_id
    }

# Import routes
from routes import digital_twin, simulation, cv_analysis, interview, chat

app.include_router(digital_twin.router, prefix="/api/twin", tags=["Digital Twin"])
app.include_router(simulation.router, prefix="/api/simulation", tags=["Simulation"])
app.include_router(cv_analysis.router, prefix="/api/cv", tags=["CV Analysis"])
app.include_router(interview.router, prefix="/api/interview", tags=["Interview Coach"])
app.include_router(chat.router, prefix="/api/chat", tags=["Chat"])

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

