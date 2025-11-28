# EmpowerAI Project Structure

## Overview

This is a monorepo containing three main services:
1. **Frontend** - Next.js + TailwindCSS (Eva & Siyanda)
2. **Backend** - Node.js + Express (Lunga)
3. **AI Service** - Python FastAPI (Nicolette)

## Directory Tree

```
EmpowerAI/
│
├── frontend/                    # Next.js Frontend Application
│   ├── app/                     # Next.js 13+ app directory
│   │   ├── (auth)/             # Authentication pages
│   │   ├── dashboard/          # Main dashboard
│   │   ├── twin/               # Digital twin pages
│   │   ├── interview/          # Interview coach
│   │   └── opportunities/     # Opportunities hub
│   ├── components/
│   │   ├── ui/                 # Reusable UI components
│   │   ├── charts/             # Chart components (Recharts)
│   │   └── forms/              # Form components
│   ├── lib/                    # Utilities, API clients
│   ├── hooks/                  # Custom React hooks
│   ├── types/                  # TypeScript type definitions
│   ├── public/                 # Static assets
│   ├── package.json
│   ├── tsconfig.json
│   ├── tailwind.config.js
│   └── next.config.js
│
├── backend/                     # Node.js Backend API
│   ├── routes/                 # API route handlers
│   │   ├── auth.js            # Authentication routes
│   │   ├── twin.js            # Digital twin routes
│   │   ├── simulation.js      # Simulation routes
│   │   ├── cv.js              # CV analysis routes
│   │   ├── opportunities.js   # Opportunities routes
│   │   └── interview.js       # Interview routes
│   ├── models/                 # MongoDB models
│   │   ├── User.js
│   │   └── EconomicTwin.js
│   ├── controllers/            # Business logic
│   ├── middleware/             # Auth, validation, etc.
│   ├── services/               # External service integrations
│   ├── utils/                  # Helper functions
│   ├── data/                   # Static data
│   │   └── opportunities/     # SA opportunities data
│   ├── server.js               # Express app entry
│   └── package.json
│
├── ai-service/                  # Python FastAPI AI Engine
│   ├── services/
│   │   ├── digital_twin.py    # Digital twin generation
│   │   ├── simulation_engine.py  # Path simulation
│   │   ├── cv_analyzer.py     # CV parsing & analysis
│   │   └── interview_coach.py # Interview simulation
│   ├── models/                 # AI models & prompts
│   ├── utils/                  # NLP utilities
│   ├── main.py                # FastAPI app entry
│   ├── requirements.txt
│   └── README.md
│
├── docs/                        # Documentation
│   ├── TEAM_WORKFLOW.md       # Team workflow guide
│   └── API_DOCUMENTATION.md   # API reference
│
├── shared/                      # Shared types, utilities
│
├── .gitignore
├── package.json                # Root package.json (monorepo)
├── README.md                   # Main project README
└── PROJECT_STRUCTURE.md        # This file
```

## Service Responsibilities

### Frontend (`frontend/`)
- **Team:** Eva & Siyanda
- **Tech:** Next.js 14, React, TypeScript, TailwindCSS, Recharts
- **Port:** 3000
- **Key Features:**
  - User authentication UI
  - Dashboard with charts
  - Digital twin visualization
  - Interview coach interface
  - Opportunities hub

### Backend (`backend/`)
- **Team:** Lunga
- **Tech:** Node.js, Express, MongoDB, Mongoose
- **Port:** 5000
- **Key Features:**
  - REST API endpoints
  - User authentication
  - Database models
  - Integration with AI service
  - Opportunities data management

### AI Service (`ai-service/`)
- **Team:** Nicolette (Lead)
- **Tech:** Python, FastAPI, OpenAI API
- **Port:** 8000
- **Key Features:**
  - Digital twin generation
  - Path simulation engine
  - CV analysis
  - Interview coaching
  - AI-powered recommendations

## Communication Flow

```
User → Frontend (3000) → Backend (5000) → AI Service (8000)
                                    ↓
                              MongoDB Atlas
```

## Development Commands

### Run All Services
```bash
npm run dev:all
```

### Run Individual Services
```bash
npm run dev:frontend   # Frontend only
npm run dev:backend    # Backend only
npm run dev:ai         # AI service only
```

### Install Dependencies
```bash
npm run install:all
```

## Environment Setup

Each service requires its own `.env` file:

1. **Frontend:** `frontend/.env`
   - `NEXT_PUBLIC_API_URL`
   - `NEXT_PUBLIC_AI_SERVICE_URL`

2. **Backend:** `backend/.env`
   - `MONGODB_URI`
   - `JWT_SECRET`
   - `AI_SERVICE_URL`

3. **AI Service:** `ai-service/.env`
   - `OPENAI_API_KEY`
   - `MODEL_NAME`

Copy `.env.example` files and fill in values.

## Team Workflow

1. **Nicolette** - Focus on `ai-service/` (AI logic, simulations)
2. **Lunga** - Focus on `backend/` (API, database, auth)
3. **Eva & Siyanda** - Focus on `frontend/` (UI, components, charts)
4. **Lindy** - Focus on `docs/` and `backend/data/opportunities/`

## Next Steps

1. ✅ Project structure created
2. ⏳ Set up environment variables
3. ⏳ Install dependencies
4. ⏳ Implement core features
5. ⏳ Integration testing
6. ⏳ Demo preparation

