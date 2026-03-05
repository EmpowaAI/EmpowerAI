<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=6,11,20&height=200&section=header&text=EmpowerAI&fontSize=80&fontColor=fff&animation=twinkling&fontAlignY=35&desc=Your%20Future%2C%20Visualized.%20Your%20Potential%2C%20Unleashed.&descAlignY=60&descSize=18" width="100%"/>

<br/>

[![Status](https://img.shields.io/badge/status-active-00d68f?style=for-the-badge&logo=statuspage&logoColor=white)](https://empowa.org)
[![License](https://img.shields.io/badge/license-MIT-667eea?style=for-the-badge&logo=opensourceinitiative&logoColor=white)](LICENSE)
[![Stack](https://img.shields.io/badge/stack-React%20%7C%20Node.js%20%7C%20Python-f5576c?style=for-the-badge&logo=stackshare&logoColor=white)]()
[![Users](https://img.shields.io/badge/active%20users-1%2C000%2B-fa709a?style=for-the-badge&logo=users&logoColor=white)]()

<br/>

[🌐 Live Demo](https://www.empowa.org) &nbsp;·&nbsp; [📖 Docs](docs/) &nbsp;·&nbsp; [🐛 Report Bug](https://github.com/NickiMash17/EmpowerAI/issues) &nbsp;·&nbsp; [✨ Request Feature](https://github.com/NickiMash17/EmpowerAI/issues)

<br/>

</div>

---

## 🌍 What is EmpowerAI?

> *"What if you could see your future before it happens?"*

**EmpowerAI** is South Africa's first **Digital Economic Twin** platform — a living AI model that mirrors your economic potential and simulates different career paths so you can make informed, confident decisions about your future.

We're not just another career tool. We're your **crystal ball for financial success**, built specifically for South African youth navigating a 63% unemployment landscape.

```
❌  No clear path to economic independence       →    ✅  Personalized career roadmap
❌  Limited visibility into earning potential    →    ✅  3/6/12-month income projections
❌  CVs that don't stand out in the SA market    →    ✅  8-dimension ATS-optimized CV analysis
❌  Interview anxiety and unpreparedness         →    ✅  Voice-enabled AI interview coach
❌  Disconnection from real opportunities        →    ✅  Smart opportunity matching by province
```

---

## ✨ Core Features

<table>
<tr>
<td width="50%">

### 🔮 Digital Economic Twin
Your personalized AI avatar that simulates multiple economic futures based on your skills, education, and choices.
- 8-dimension CV scoring system
- ATS compatibility analysis
- SA market salary insights by province
- Skills gap identification & career trajectory predictions

</td>
<td width="50%">

### 📊 Path Simulation Engine
See your future income with projections across **6 career pathways**:
- 🎓 Learnerships · 💼 Freelancing
- 📚 Short Courses · 💻 Entry-Level Tech
- 🏢 Internships · 🎯 Graduate Programs

</td>
</tr>
<tr>
<td width="50%">

### 🎤 Voice Interview Coach
Practice real interviews with AI-powered feedback:
- Voice recognition & synthesis (Web Speech API)
- Instant scoring & improvement tips
- Speaking pace & clarity analysis
- Company-specific question simulation

</td>
<td width="50%">

### 🎮 Gamification System
Stay motivated and track your growth:
- 🥉 Bronze → 🥈 Silver → 🥇 Gold → 💎 Platinum → 💠 Diamond
- XP for every action, achievement unlocking
- Leaderboards & 7/30-day streak tracking

</td>
</tr>
<tr>
<td width="50%">

### 🗺️ Economic Roadmap
Your GPS to success in the SA job market — a visual journey map showing steps, milestones, and skills to develop.

</td>
<td width="50%">

### 🤖 24/7 AI Mentor
Personalized career guidance anytime:
- CV reviews, salary negotiation, SA-specific insights
- BEE, employment equity & POPI compliance guidance

</td>
</tr>
</table>

---

## 🏗️ Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                         👤  User                             │
└─────────────────────────┬────────────────────────────────────┘
                          │
          ┌───────────────▼───────────────┐
          │  🎨  React Frontend           │
          │  Vite · TypeScript · Tailwind │
          │  Recharts · Framer Motion     │
          └───────────────┬───────────────┘
                          │  HTTP / REST
          ┌───────────────▼───────────────┐
          │  ⚡  Node.js Backend           │
          │  Express · MongoDB · JWT      │
          │  Brevo Email · Bcrypt         │
          └───────────────┬───────────────┘
                          │  HTTP / REST
          ┌───────────────▼───────────────┐
          │  🤖  Python AI Service        │
          │  FastAPI · OpenAI GPT-4       │
          │  Digital Twin · CV Analyzer   │
          └───────────────┬───────────────┘
                          │
          ┌───────────────▼───────────────┐
          │  🗄️  MongoDB Atlas            │
          │  Users · Twins · Simulations  │
          │  CV History · Gamification    │
          └───────────────────────────────┘
```

**Key API Endpoints:**

| Prefix | Description |
|--------|-------------|
| `/auth/*` | Authentication & registration |
| `/cv/*` | CV analysis & scoring |
| `/twin/*` | Digital twin operations |
| `/simulation/*` | Career path simulations |
| `/opportunities/*` | Job matching |
| `/interview/*` | Interview coaching |
| `/gamification/*` | XP, levels & leaderboard |

---

## 🛠️ Tech Stack

| Layer | Technologies |
|-------|-------------|
| **Frontend** | React 18, TypeScript, Vite, TailwindCSS, Recharts, Framer Motion, Radix UI |
| **Backend** | Node.js 18+, Express.js, MongoDB + Mongoose, JWT, Bcrypt, Brevo API |
| **AI Service** | Python 3.10+, FastAPI, OpenAI GPT-4, Pydantic, Uvicorn |
| **Infrastructure** | MongoDB Atlas, Vercel, Render, GitHub Actions *(planned)* |

---

## 🚀 Quick Start

**Prerequisites:** Node.js 18+, Python 3.10+, MongoDB Atlas account, OpenAI API Key, Brevo API Key

```bash
# 1. Clone the repository
git clone https://github.com/NickiMash17/EmpowerAI.git
cd EmpowerAI

# 2. Install all dependencies
npm run install:all

# 3. Configure environment variables (see below)

# 4. Launch all services
npm run dev:all
```

<details>
<summary>📋 Environment Variables</summary>

**`frontend/.env`**
```env
VITE_API_URL=http://localhost:5000/api
```

**`empowerai-backend/.env`**
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_jwt_key
AI_SERVICE_URL=http://localhost:8000/api
BREVO_API_KEY=your_brevo_api_key
FRONTEND_URL=http://localhost:5173
```

**`ai-service/.env`**
```env
OPENAI_API_KEY=your_openai_api_key
BACKEND_URL=http://localhost:5000/api
```
</details>

Once running, your services will be live at:

| Service | URL |
|---------|-----|
| 🎨 Frontend | http://localhost:5173 |
| ⚡ Backend | http://localhost:5000 |
| 🤖 AI Service | http://localhost:8000 |

---

## 📁 Project Structure

```
EmpowerAI/
├── 🎨 frontend/                  # React + Vite + TypeScript
│   └── src/
│       ├── pages/                # Application pages
│       ├── components/ui/        # Neural Fusion design system
│       ├── lib/                  # API clients, utilities, context
│       └── styles/               # Theme system
│
├── ⚡ empowerai-backend/          # Node.js + Express + MongoDB
│   └── src/
│       ├── routes/               # API endpoints
│       ├── controllers/          # Request handlers
│       ├── services/             # Business logic
│       ├── DTOs/                 # Data transfer objects
│       ├── models/               # MongoDB schemas
│       └── middleware/           # Auth, validation, logging
│
└── 🤖 ai-service/                # Python + FastAPI + OpenAI
    └── services/
        ├── digital_twin.py       # Economic twin generation
        ├── simulation_engine.py  # 6-path projections
        ├── cv_analyzer.py        # 8D CV scoring
        └── interview_coach.py    # Voice interview AI
```

---

## 🗺️ Roadmap

**Q1 2026 — Current**

- [x] 🔐 Secure authentication system
- [x] 🎨 Professional design system
- [x] 🤖 8-dimension CV analysis
- [x] 🎙️ Voice interview coach
- [x] 🎮 Gamification system
- [ ] 📱 Progressive Web App (PWA)
- [ ] 🔔 Push notifications

**Q2 2026**

- [ ] 📱 Mobile app (React Native)
- [ ] 🌍 Multi-language support (Zulu, Xhosa, Afrikaans)
- [ ] 🤝 SA job board integrations (PNet, Indeed, CareerJunction)

**Q3–Q4 2026**

- [ ] 💬 Community & peer networking features
- [ ] 🏆 Mentorship matching
- [ ] 🤖 AI-powered cover letter generator
- [ ] 🌍 Expansion to other African countries

> **Vision 2030:** Empower 1 million South African youth to achieve economic independence.

---

## 👥 Meet the Team

<div align="center">

*Built with ❤️ by **Team Tech Bridle***

<br/>

<table>
  <tr>
    <td align="center" width="220">
      <a href="https://github.com/NickiMash17">
        <img src="https://github.com/NickiMash17.png" width="100px" style="border-radius:50%" alt="Nicolette"/>
        <br/><br/>
        <b>Nicolette</b>
      </a>
      <br/>
      <sub>💻 Full Stack Engineer · AI Integration Lead</sub>
      <br/><br/>
      <a href="https://github.com/NickiMash17">
        <img src="https://img.shields.io/badge/@NickiMash17-181717?style=flat-square&logo=github&logoColor=white"/>
      </a>
      <br/><br/>
      <sub>Full Stack Development · Digital Twin Algorithms · Simulation Engine · AI Integration</sub>
      <br/><br/>
      <img src="https://img.shields.io/badge/Python-3776AB?style=flat-square&logo=python&logoColor=white"/>
      <img src="https://img.shields.io/badge/FastAPI-009688?style=flat-square&logo=fastapi&logoColor=white"/>
      <img src="https://img.shields.io/badge/OpenAI-412991?style=flat-square&logo=openai&logoColor=white"/>
    </td>
    <td align="center" width="220">
      <a href="https://github.com/Lunga-Mashaba">
        <img src="https://github.com/Lunga-Mashaba.png" width="100px" style="border-radius:50%" alt="Lunga"/>
        <br/><br/>
        <b>Lunga</b>
      </a>
      <br/>
      <sub>💻 Senior Backend Engineer</sub>
      <br/><br/>
      <a href="https://github.com/Lunga-Mashaba">
        <img src="https://img.shields.io/badge/@Lunga--Mashaba-181717?style=flat-square&logo=github&logoColor=white"/>
      </a>
      <br/><br/>
      <sub>Authentication · Database Architecture · RESTful APIs · Performance Optimization</sub>
      <br/><br/>
      <img src="https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=nodedotjs&logoColor=white"/>
      <img src="https://img.shields.io/badge/MongoDB-47A248?style=flat-square&logo=mongodb&logoColor=white"/>
      <img src="https://img.shields.io/badge/Express-000000?style=flat-square&logo=express&logoColor=white"/>
    </td>
    <td align="center" width="220">
      <a href="https://github.com/Siya-tec">
        <img src="https://github.com/Siya-tec.png" width="100px" style="border-radius:50%" alt="Siyanda"/>
        <br/><br/>
        <b>Siyanda</b>
      </a>
      <br/>
      <sub>🎨 Lead Frontend & UI/UX</sub>
      <br/><br/>
      <a href="https://github.com/Siya-tec">
        <img src="https://img.shields.io/badge/@Siya--tec-181717?style=flat-square&logo=github&logoColor=white"/>
      </a>
      <br/><br/>
      <sub>UI/UX Design · Responsive Layouts · Data Visualizations · Design System</sub>
      <br/><br/>
      <img src="https://img.shields.io/badge/React-61DAFB?style=flat-square&logo=react&logoColor=black"/>
      <img src="https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white"/>
      <img src="https://img.shields.io/badge/Tailwind-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white"/>
    </td>
    <td align="center" width="220">
      <a href="https://github.com/khulisojohn">
        <img src="https://github.com/khulisojohn.png" width="100px" style="border-radius:50%" alt="Khuliso"/>
        <br/><br/>
        <b>Khuliso</b>
      </a>
      <br/>
      <sub>🔧 Backend & Systems Architect</sub>
      <br/><br/>
      <a href="https://github.com/khulisojohn">
        <img src="https://img.shields.io/badge/@khulisojohn-181717?style=flat-square&logo=github&logoColor=white"/>
      </a>
      <br/><br/>
      <sub>Email Auth · Security Hardening · AI Chatbot Integration · Gamification Backend</sub>
      <br/><br/>
      <img src="https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=nodedotjs&logoColor=white"/>
      <img src="https://img.shields.io/badge/JWT-000000?style=flat-square&logo=jsonwebtokens&logoColor=white"/>
      <img src="https://img.shields.io/badge/Bcrypt-003A70?style=flat-square&logo=letsencrypt&logoColor=white"/>
    </td>
  </tr>
</table>

</div>

---

## 📊 Project Stats

<div align="center">

| Metric | Value |
|--------|-------|
| 📝 Lines of Code | 50,000+ |
| 🧩 Frontend Components | 80+ |
| 🔌 API Endpoints | 50+ |
| 🤖 AI Prompts | 30+ |
| 👤 Active Users | 1,000+ |
| 📄 CV Analyses | 5,000+ |
| 🎤 Interview Simulations | 3,000+ |
| 🗺️ Career Paths Simulated | 10,000+ |

</div>

---

## 🤝 Contributing

We welcome contributions from developers, designers, and domain experts!

```bash
# 1. Fork the repository
# 2. Create your feature branch
git checkout -b feature/AmazingFeature

# 3. Commit your changes
git commit -m 'feat: add AmazingFeature'

# 4. Push to your branch
git push origin feature/AmazingFeature

# 5. Open a Pull Request
```

**Areas where we'd love help:**
- 🌍 Translations (Zulu, Xhosa, Afrikaans)
- 🤖 AI prompt engineering
- 🎨 UI/UX improvements
- 🐛 Bug fixes & testing
- 📝 Documentation

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=6,11,20&height=120&section=footer&animation=twinkling" width="100%"/>

**© 2026 Team Tech Bridle · All Rights Reserved**

*Making economic empowerment accessible to every South African youth.*

[![GitHub stars](https://img.shields.io/github/stars/NickiMash17/EmpowerAI?style=social)](https://github.com/NickiMash17/EmpowerAI/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/NickiMash17/EmpowerAI?style=social)](https://github.com/NickiMash17/EmpowerAI/network/members)
[![GitHub watchers](https://img.shields.io/github/watchers/NickiMash17/EmpowerAI?style=social)](https://github.com/NickiMash17/EmpowerAI/watchers)

</div>
