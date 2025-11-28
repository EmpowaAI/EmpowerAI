# EmpowerAI
**Youth Economic Digital Twin Platform**

AI-Accelerated Solutions for Youth Economic Empowerment

Melsoft Academy Hackathon 2025 | Team: Nicolette (Lead), Lunga, Eva, Siyanda, Lindy

---

## 🎯 Project Overview

EmpowerAI introduces an innovative, first-of-its-kind AI Digital Economic Twin: a predictive simulation model that allows youth to visualize their future earning potential based on their skills, background, education, and chosen career path.

### Key Features
- 🎭 **Digital Economic Twin** - Personalized AI model of the user
- 📊 **Path Simulation Engine** - 3, 6, and 12-month income projections
- 🗺️ **Economic Roadmap** - Visual journey to achieve goals
- 📄 **AI CV Analyzer** - Extract skills and improve CVs
- 🎯 **AI Job Fit Analyzer** - Match users to SA opportunities
- 🎤 **AI Interview Coach** - Simulate interviews with feedback

---

## 🏗️ Project Structure

```
EmpowerAI/
├── frontend/          # Next.js + TailwindCSS (Eva & Siyanda)
├── backend/           # Node.js + Express API (Lunga)
├── ai-service/        # Python FastAPI AI Engine (Nicolette)
├── docs/              # Documentation (Lindy)
└── shared/            # Shared types, utilities, configs
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Python 3.10+
- MongoDB Atlas account (or local MongoDB)

### Installation

1. **Clone and install dependencies:**
   ```bash
   npm run install:all
   ```

2. **Set up environment variables:**
   - Copy `.env.example` files in each directory
   - Fill in your API keys and database URLs

3. **Run all services:**
   ```bash
   npm run dev:all
   ```

### Individual Service Setup

#### Frontend (Port 3000)
```bash
cd frontend
npm install
npm run dev
```

#### Backend (Port 5000)
```bash
cd backend
npm install
npm run dev
```

#### AI Service (Port 8000)
```bash
cd ai-service
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

---

## 👥 Team Roles & Development Workflow

### Nicolette (Team Lead / AI Developer)
- **Focus:** AI service, simulation engine, digital twin logic
- **Directory:** `ai-service/`
- **Key Files:**
  - `ai-service/services/digital_twin.py`
  - `ai-service/services/simulation_engine.py`
  - `ai-service/services/scoring_models.py`

### Lunga (Backend Developer)
- **Focus:** Node.js API, database models, authentication
- **Directory:** `backend/`
- **Key Files:**
  - `backend/routes/`
  - `backend/models/`
  - `backend/middleware/`

### Eva & Siyanda (Frontend Developers)
- **Focus:** React components, UI/UX, data visualization
- **Directory:** `frontend/`
- **Key Files:**
  - `frontend/app/` (Next.js app directory)
  - `frontend/components/`
  - `frontend/lib/`

### Lindy (Research & Documentation)
- **Focus:** SA opportunities data, user testing, documentation
- **Directory:** `docs/`, `backend/data/opportunities/`

---

## 📁 Detailed Structure

### Frontend (`frontend/`)
```
frontend/
├── app/                    # Next.js 13+ app directory
│   ├── (auth)/            # Auth pages
│   ├── dashboard/         # Main dashboard
│   ├── twin/              # Digital twin pages
│   ├── interview/         # Interview coach
│   └── opportunities/     # Opportunities hub
├── components/
│   ├── ui/                # Reusable UI components
│   ├── charts/            # Chart components (Recharts)
│   └── forms/             # Form components
├── lib/                   # Utilities, API clients
├── hooks/                 # Custom React hooks
├── types/                 # TypeScript types
└── public/                # Static assets
```

### Backend (`backend/`)
```
backend/
├── routes/                # API route handlers
│   ├── auth.js
│   ├── twin.js
│   ├── simulation.js
│   ├── cv.js
│   └── opportunities.js
├── models/                # MongoDB models
├── controllers/           # Business logic
├── middleware/            # Auth, validation, etc.
├── services/              # External service integrations
├── utils/                 # Helper functions
└── data/                  # Static data (opportunities, etc.)
```

### AI Service (`ai-service/`)
```
ai-service/
├── services/
│   ├── digital_twin.py    # Digital twin generation
│   ├── simulation_engine.py  # Path simulation
│   ├── cv_analyzer.py     # CV parsing & analysis
│   ├── interview_coach.py # Interview simulation
│   └── scoring_models.py  # Empowerment scoring
├── models/                # AI models & prompts
├── utils/                 # NLP utilities
└── main.py               # FastAPI app entry
```

---

## 🔧 Development Guidelines

### Code Style
- **Frontend:** ESLint + Prettier (configured)
- **Backend:** ESLint (Node.js standard)
- **Python:** Black formatter, PEP 8

### Git Workflow
1. Create feature branches: `feature/your-feature-name`
2. Commit frequently with clear messages
3. Push to your branch, create PR for review
4. Nicolette reviews and merges

### API Communication
- Frontend → Backend: `http://localhost:5000/api`
- Backend → AI Service: `http://localhost:8000`

---

## 📊 Architecture Flow

```
User → React Frontend (Next.js) → Node.js Backend (Express) → Python AI Service (FastAPI)
                                                              ↓
                                                         MongoDB Atlas
```

---

## 🎯 36-Hour Timeline Reference

- **Hours 1-3:** Planning & Setup ✅
- **Hours 3-8:** Backend + Frontend Scaffolding
- **Hours 8-14:** AI Twin + Simulation Engine
- **Hours 14-20:** Dashboard + Visuals
- **Hours 20-26:** Interview Coach + CV Features
- **Hours 26-32:** Opportunity Hub
- **Hours 32-34:** Testing + Polishing
- **Hours 34-36:** Pitch Deck & Presentation

---

## 📝 Environment Variables

See `.env.example` files in each service directory for required variables.

---

## 🤝 Contributing

1. Assign yourself to a task
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit PR for review

---

## 📞 Contact

**Team Lead:** Nicolette

---

## 📄 License

MIT License - Melsoft Academy Hackathon 2025
