<div align="center">

# ✨ EmpowerAI

### 🚀 Your Future, Visualized. Your Potential, Unleashed.

**AI-Powered Digital Economic Twin Platform for Youth Empowerment**

[![Status](https://img.shields.io/badge/status-active-success.svg)]()
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Tech Stack](https://img.shields.io/badge/stack-React%20%7C%20Node.js%20%7C%20Python-orange.svg)]()

---

</div>

## 🌟 What is EmpowerAI?

Imagine if you could **see your future** before it happens. What if you could **simulate different career paths** and watch your income grow over time? What if you had an **AI-powered coach** guiding you every step of the way?

**That's EmpowerAI.**

We've created the world's first **Digital Economic Twin** – a living, breathing AI model that mirrors your economic potential. It's not just a career tool. It's your **crystal ball** for financial success.

### 🎯 The Problem We Solve

Millions of young people face the same question: *"What should I do with my life?"*

- ❌ No clear path to economic independence
- ❌ Limited visibility into future earning potential  
- ❌ Lack of personalized career guidance
- ❌ CVs that don't stand out
- ❌ Interview anxiety and unpreparedness

### ✨ The EmpowerAI Solution

We don't just tell you what to do – **we show you what's possible.**

---

## 🎨 Core Features

### 🔮 Digital Economic Twin
Your personalized AI avatar that simulates multiple economic futures based on your skills, education, and choices. Watch your empowerment score grow as you level up.

### 📊 Path Simulation Engine
**See your future income** with 3, 6, and 12-month projections across 6 different career pathways:
- 🎓 Learnerships
- 💼 Freelancing
- 📚 Short Courses
- 💻 Entry-Level Tech
- 🏢 Internships
- 🎯 Graduate Programs

### 🗺️ Economic Roadmap
A visual journey map showing exactly what steps to take, which milestones to hit, and what skills you need to develop. **Your GPS to success.**

### 📝 AI CV Analyzer
Upload your CV and watch our AI:
- ✂️ Extract your skills automatically
- 🔍 Identify gaps vs. job requirements
- 💡 Generate improvement suggestions
- ✨ Create an enhanced version

### 🎯 Job Fit Matching
Get matched with real opportunities in South Africa – learnerships, bursaries, internships, and entry-level positions tailored to your profile.

### 🎤 Interview Coach
Practice makes perfect. Our AI interview coach:
- 🎭 Simulates real interviews (tech, behavioral, non-tech)
- 📈 Provides instant feedback and scoring
- 🎯 Adapts to company-specific questions
- 📊 Tracks your improvement over time

---

## 🏗️ Architecture

```
┌─────────────┐
│   👤 User   │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────────┐
│  🎨 React Frontend (Vite + TS)      │
│  • Beautiful UI/UX                  │
│  • Real-time visualizations         │
│  • Interactive dashboards           │
└──────┬──────────────────────────────┘
       │ HTTP/REST
       ▼
┌─────────────────────────────────────┐
│  ⚡ Node.js Backend (Express)       │
│  • RESTful API                      │
│  • Authentication & Authorization   │
│  • Business Logic                   │
└──────┬──────────────────────────────┘
       │ HTTP/REST
       ▼
┌─────────────────────────────────────┐
│  🤖 Python AI Service (FastAPI)     │
│  • OpenAI Integration               │
│  • Digital Twin Generation          │
│  • Simulation Engine                │
│  • CV Analysis & Interview Coach    │
└──────┬──────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│  🗄️  MongoDB Atlas                  │
│  • User Data                        │
│  • Economic Twins                   │
│  • Simulation History               │
└─────────────────────────────────────┘
```

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ and npm
- **Python** 3.10+
- **MongoDB Atlas** account (or local MongoDB)

### Installation

**1. Clone the repository**
```bash
git clone https://github.com/NickiMash17/EmpowerAI.git
cd EmpowerAI
```

**2. Install all dependencies**
```bash
npm run install:all
```

**3. Set up environment variables**

Create `.env` files in each service directory:
- `frontend/.env`
- `empowerai-backend/.env`
- `ai-service/.env`

See `.env.example` files for required variables.

**4. Launch everything**
```bash
npm run dev:all
```

🎉 **That's it!** Your services are now running:
- Frontend: http://localhost:5173
- Backend: http://localhost:5000
- AI Service: http://localhost:8000

---

## 📁 Project Structure

```
EmpowerAI/
│
├── 🎨 frontend/              # React + Vite + TypeScript + TailwindCSS
│   ├── src/
│   │   ├── pages/           # All application pages
│   │   ├── lib/             # API clients, utilities, context
│   │   └── assets/          # Images, icons
│   └── public/              # Static assets
│
├── ⚡ empowerai-backend/     # Node.js + Express + MongoDB
│   ├── src/
│   │   ├── routes/          # API endpoints
│   │   ├── controllers/     # Business logic
│   │   ├── models/          # MongoDB schemas
│   │   └── middleware/      # Auth, validation, logging
│   └── scripts/             # Database seeding
│
├── 🤖 ai-service/            # Python + FastAPI + OpenAI
│   ├── services/            # Core AI logic
│   │   ├── digital_twin.py
│   │   ├── simulation_engine.py
│   │   ├── cv_analyzer.py
│   │   └── interview_coach.py
│   ├── routes/              # API endpoints
│   ├── models/              # Pydantic schemas
│   └── utils/               # Helpers, logger
│
└── 📚 docs/                  # Documentation
    ├── API_DOCUMENTATION.md
    └── BACKEND_INTEGRATION_IMPROVEMENTS.md
```

---

## 👥 The Team

### 🎯 Nicolette (Team Lead & AI Architect)
**The Visionary** | Building the AI brain that powers everything
- 🧠 Digital Twin algorithms
- 🎲 Simulation engine logic
- 🤖 OpenAI integration
- 📊 Empowerment scoring models

### 💻 Lunga (Backend Engineer)
**The Architect** | Crafting robust APIs and data flows
- 🔐 Authentication & security
- 🗄️ Database design & optimization
- 🔌 API integrations
- ⚡ Performance optimization

### 🎨 Siyanda (Frontend Developer)
**The Artist** | Creating beautiful, intuitive experiences
- 🖼️ UI/UX design
- 📱 Responsive layouts
- 📊 Data visualizations
- ⚡ Performance optimization

---

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Lightning-fast build tool
- **TailwindCSS** - Utility-first styling
- **Recharts** - Beautiful data visualizations
- **React Router** - Navigation

### Backend
- **Node.js** - Runtime
- **Express.js** - Web framework
- **MongoDB + Mongoose** - Database & ODM
- **JWT** - Authentication
- **Express Validator** - Input validation
- **Axios** - HTTP client

### AI Service
- **Python 3.10+** - Language
- **FastAPI** - Modern web framework
- **OpenAI API** - GPT-4 for AI features
- **Pydantic** - Data validation
- **Uvicorn** - ASGI server

### Infrastructure
- **MongoDB Atlas** - Cloud database
- **Vercel** - Frontend hosting
- **Render** - Backend & AI service hosting

---

## 🎯 Key Differentiators

### What Makes Us Unique?

1. **🔮 Predictive Modeling** - We don't just show you jobs, we show you your **future income**
2. **🎯 Personalized AI** - Every recommendation is tailored to **your unique profile**
3. **📊 Visual Storytelling** - Complex data becomes **beautiful, understandable charts**
4. **🚀 Real Opportunities** - We connect you to **actual SA opportunities**, not just generic advice
5. **🎓 Complete Journey** - From CV to interview to career path – **we've got you covered**

---

## 📖 Development Workflow

### Running Individual Services

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

**Backend:**
```bash
cd empowerai-backend
npm install
npm run dev
```

**AI Service:**
```bash
cd ai-service
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

### Code Style
- **Frontend:** ESLint + Prettier
- **Backend:** ESLint (Node.js standard)
- **Python:** Black formatter, PEP 8

### Git Workflow
1. Create feature branch: `feature/your-feature-name`
2. Commit with clear messages
3. Push and create PR
4. Code review → Merge

---

## 🌐 API Communication

```
Frontend (Port 5173)
    ↓ HTTP/REST
Backend API (Port 5000)
    ↓ HTTP/REST
AI Service (Port 8000)
    ↓
MongoDB Atlas
```

**Base URLs:**
- Frontend → Backend: `http://localhost:5000/api`
- Backend → AI Service: `http://localhost:8000/api`

---

## 📚 Documentation

- **[API Documentation](docs/API_DOCUMENTATION.md)** - Complete API reference
- **[Backend Integration](docs/BACKEND_INTEGRATION_IMPROVEMENTS.md)** - Integration guide
- **[AI Service README](ai-service/README.md)** - AI service details

---

## 🎓 Use Cases

### For Students
- 🎯 Discover which career path maximizes your earning potential
- 📚 See how additional courses impact your future income
- 💼 Find learnerships and internships that match your skills

### For Job Seekers
- 📝 Get AI-powered CV improvements
- 🎤 Practice interviews with instant feedback
- 🎯 Match with opportunities tailored to your profile

### For Career Changers
- 🔄 Simulate different career transitions
- 📊 Compare income projections across paths
- 🗺️ Get a roadmap for your transition

---

## 🚧 Roadmap

- [ ] 🔔 Real-time notifications for new opportunities
- [ ] 📱 Mobile app (React Native)
- [ ] 🌍 Multi-province expansion
- [ ] 🤝 Integration with job boards
- [ ] 📈 Advanced analytics dashboard
- [ ] 🎓 Skills gap analysis
- [ ] 💬 Community features

---

## 🤝 Contributing

We welcome contributions! Here's how:

1. 🍴 Fork the repository
2. 🌿 Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. 💾 Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. 📤 Push to the branch (`git push origin feature/AmazingFeature`)
5. 🔀 Open a Pull Request

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 💬 Contact

**Team Lead:** Nicolette

**Project Link:** [https://github.com/NickiMash17/EmpowerAI](https://github.com/NickiMash17/EmpowerAI)

---

<div align="center">

### ⭐ Star us on GitHub if you find this project helpful!

**Built with ❤️ by Team Nicolette**

*Empowering the next generation, one digital twin at a time.*

</div>
## Pair Collaboration

This README update was completed through pair programming collaboration.
