# Team Workflow Guide

## Daily Standup Structure

### Quick Check-ins (15 min)
1. What did you complete yesterday?
2. What are you working on today?
3. Any blockers?

## Git Workflow

### Branch Naming
- `feature/your-feature-name` - New features
- `fix/bug-description` - Bug fixes
- `refactor/what-you-refactored` - Code improvements

### Commit Messages
Use clear, descriptive messages:
- `feat: add user authentication`
- `fix: resolve CV upload issue`
- `refactor: improve simulation engine`

## Communication Channels

### For Quick Questions
- Use team chat/WhatsApp

### For Code Reviews
- Create PR, tag @Nicolette for review

### For Blockers
- Tag immediately, don't wait

## Development Priorities

### Phase 1 (Hours 3-8): Foundation
- ✅ Project structure (DONE)
- Backend: Auth + basic routes
- Frontend: Landing page + auth pages

### Phase 2 (Hours 8-14): Core AI
- AI Service: Digital Twin generation
- AI Service: Simulation engine
- Backend: Integration with AI service

### Phase 3 (Hours 14-20): Dashboard
- Frontend: Dashboard UI
- Frontend: Charts and visualizations
- Frontend: Roadmap component

### Phase 4 (Hours 20-26): Features
- AI Service: CV analyzer
- AI Service: Interview coach
- Frontend: Feature pages

### Phase 5 (Hours 26-32): Opportunities
- Backend: Opportunities data
- Frontend: Opportunities hub
- Integration testing

### Phase 6 (Hours 32-36): Polish
- Bug fixes
- UI/UX improvements
- Demo preparation

## Testing Checklist

Before submitting PR:
- [ ] Code runs without errors
- [ ] No console errors/warnings
- [ ] Tested on your local machine
- [ ] Follows project structure
- [ ] No hardcoded values (use env vars)

## API Endpoints Reference

### Backend (Port 5000)
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/twin/create` - Create digital twin
- `POST /api/simulation/run` - Run path simulation
- `POST /api/cv/analyze` - Analyze CV
- `GET /api/opportunities` - Get opportunities

### AI Service (Port 8000)
- `POST /api/twin/generate` - Generate twin
- `POST /api/simulation/paths` - Simulate paths
- `POST /api/cv/analyze` - CV analysis
- `POST /api/interview/start` - Start interview

## Environment Setup Reminder

Each service needs its own `.env` file:
- Copy `.env.example` to `.env`
- Fill in required values
- Never commit `.env` files!

