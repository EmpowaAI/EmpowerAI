"""
EmpowerAI AI Service
FastAPI service for Digital Twin generation, simulations, and AI features
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

load_dotenv()

app = FastAPI(
    title="EmpowerAI AI Service",
    description="AI Engine for Digital Twin, Simulations, and Analysis",
    version="1.0.0"
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
    return {
        "status": "ok",
        "message": "EmpowerAI AI Service is running",
        "version": "1.0.0"
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

# Import routes (to be created)
# from services.digital_twin import router as twin_router
# from services.simulation_engine import router as simulation_router
# from services.cv_analyzer import router as cv_router
# from services.interview_coach import router as interview_router

# app.include_router(twin_router, prefix="/api/twin", tags=["Digital Twin"])
# app.include_router(simulation_router, prefix="/api/simulation", tags=["Simulation"])
# app.include_router(cv_router, prefix="/api/cv", tags=["CV Analysis"])
# app.include_router(interview_router, prefix="/api/interview", tags=["Interview Coach"])

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

