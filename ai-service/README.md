# EmpowerAI AI Service

**Focus Area for Nicolette (Team Lead / AI Developer)**

This is the core AI engine for EmpowerAI, handling:
- Digital Twin generation
- Path simulation
- CV analysis
- Interview coaching

## Quick Start

```bash
# Create virtual environment
python -m venv venv

# Activate (Windows)
venv\Scripts\activate

# Activate (Mac/Linux)
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run server
uvicorn main:app --reload --port 8000
```

## Project Structure

```
ai-service/
├── main.py                    # FastAPI app entry point
├── services/
│   ├── digital_twin.py        # 🎯 Digital Twin generation (YOUR FOCUS)
│   ├── simulation_engine.py   # 🎯 Path simulation logic (YOUR FOCUS)
│   ├── cv_analyzer.py         # CV parsing & analysis
│   └── interview_coach.py     # Interview simulation
├── models/                    # AI models, prompts, embeddings
└── utils/                     # NLP utilities, helpers
```

## Services

### 1. Digital Twin Service (`services/digital_twin.py`)
✅ **Fully Implemented**
- AI-powered skill vector generation
- OpenAI integration for skill extraction
- Empowerment score calculation (0-100)
- Province-based income adjustments
- Path recommendations based on skills

### 2. Simulation Engine (`services/simulation_engine.py`)
✅ **Fully Implemented**
- 6 career paths (learnership, freelancing, short_course, entry_tech, internship, graduate_program)
- 3, 6, and 12-month income projections
- SA market data integration
- Province-based multipliers
- Skill growth modeling
- Milestone generation

### 3. CV Analyzer (`services/cv_analyzer.py`)
✅ **Fully Implemented**
- AI-powered skill extraction
- Gap analysis for job requirements
- Improvement suggestions
- Keyword-based fallback (works without API key)

### 4. Interview Coach (`services/interview_coach.py`)
✅ **Fully Implemented**
- AI-generated questions (tech, behavioral, non-tech)
- Response evaluation with scoring
- Personalized feedback
- Company-specific questions
- Difficulty levels

## Integration Points

### Backend Communication
The Node.js backend calls this service via HTTP:
- `POST /api/twin/generate` - Generate twin
- `POST /api/simulation/paths` - Run simulations
- `POST /api/cv/analyze` - Analyze CV
- `POST /api/interview/start` - Start interview

### Environment Variables
Create `.env` file:
```env
OPENAI_API_KEY=your-key-here
MODEL_NAME=gpt-4
EMBEDDING_MODEL=text-embedding-ada-002

# Optional: lock down /api/* endpoints so only the backend can call them
REQUIRE_AI_SERVICE_API_KEY=false
AI_SERVICE_API_KEY=replace_with_a_shared_secret
```

## Development Tips

1. **Start with Digital Twin** - This is the core feature
2. **Use OpenAI API** - For skill extraction, projections, recommendations
3. **Test with real data** - Use Asanda's example from the proposal
4. **Keep it fast** - API response time < 4 seconds (NFR1)
5. **Add logging** - Help debug during development

## API Endpoints

All endpoints are available at `http://localhost:8000/api`:

- `POST /api/twin/generate` - Generate digital twin
- `POST /api/simulation/paths` - Simulate career paths
- `POST /api/simulation/best-path` - Get best recommended path
- `POST /api/cv/analyze` - Analyze CV
- `POST /api/interview/start` - Start interview session
- `POST /api/interview/{session_id}/answer` - Submit answer

Interactive API documentation available at `http://localhost:8000/docs`

## Documentation

- See `IMPLEMENTATION_SUMMARY.md` for detailed implementation details
- See `../docs/INTEGRATION_EXAMPLES.md` for integration code examples
- See `../docs/BACKEND_INTEGRATION.md` for backend integration guide
- See `../docs/API_DOCUMENTATION.md` for full API reference

## Resources

- FastAPI Docs: https://fastapi.tiangolo.com/
- OpenAI API: https://platform.openai.com/docs
- PyPDF2 Docs: https://pypdf2.readthedocs.io/

