"""
EmpowerAI AI Service
FastAPI service for Digital Twin generation, simulations, and AI features
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os
from datetime import datetime
from utils.logger import logger

load_dotenv()

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

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5000"],
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
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "EmpowerAI AI Service",
        "timestamp": datetime.now().isoformat()
    }

# Import routes
from routes import digital_twin, simulation, cv_analysis, interview

app.include_router(digital_twin.router, prefix="/api/twin", tags=["Digital Twin"])
app.include_router(simulation.router, prefix="/api/simulation", tags=["Simulation"])
app.include_router(cv_analysis.router, prefix="/api/cv", tags=["CV Analysis"])
app.include_router(interview.router, prefix="/api/interview", tags=["Interview Coach"])

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

