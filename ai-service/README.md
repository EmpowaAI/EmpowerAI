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

## Key Implementation Areas

### 1. Digital Twin Service (`services/digital_twin.py`)

**Current Status:** Placeholder implementation

**To Implement:**
- [ ] Skill vector generation using NLP/AI
- [ ] Income projection using market data + AI
- [ ] Empowerment score calculation algorithm
- [ ] Integration with OpenAI/Llama for personalized insights

**Key Functions:**
- `generate_skill_vector()` - Extract and vectorize skills
- `calculate_empowerment_score()` - Score calculation
- `generate_twin()` - Complete twin generation

### 2. Simulation Engine (`services/simulation_engine.py`)

**Current Status:** Basic simulation structure

**To Implement:**
- [ ] Realistic income projections based on SA market data
- [ ] Skill growth modeling
- [ ] Path comparison algorithms
- [ ] AI-powered path recommendations

**Key Functions:**
- `simulate_path()` - Simulate specific career path
- `simulate_all_paths()` - Compare all paths
- `_generate_milestones()` - Create path milestones

### 3. CV Analyzer (`services/cv_analyzer.py`)

**Current Status:** Basic text extraction

**To Implement:**
- [ ] PDF/DOCX parsing (PyPDF2, python-docx)
- [ ] Skill extraction using NLP
- [ ] Gap analysis with AI
- [ ] CV improvement suggestions

### 4. Interview Coach (`services/interview_coach.py`)

**Current Status:** Question pool

**To Implement:**
- [ ] AI-generated questions (OpenAI)
- [ ] Response evaluation with AI
- [ ] Personalized feedback
- [ ] Confidence scoring

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
```

## Development Tips

1. **Start with Digital Twin** - This is the core feature
2. **Use OpenAI API** - For skill extraction, projections, recommendations
3. **Test with real data** - Use Asanda's example from the proposal
4. **Keep it fast** - API response time < 4 seconds (NFR1)
5. **Add logging** - Help debug during development

## Next Steps

1. Set up OpenAI API key
2. Implement `generate_skill_vector()` with AI
3. Build realistic income projection model
4. Create empowerment scoring algorithm
5. Test with sample user data

## Resources

- FastAPI Docs: https://fastapi.tiangolo.com/
- OpenAI API: https://platform.openai.com/docs
- PyPDF2 Docs: https://pypdf2.readthedocs.io/

