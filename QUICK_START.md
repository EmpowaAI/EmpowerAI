# Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Step 1: Install Dependencies

```bash
# Install root dependencies
npm install

# Install frontend dependencies
cd frontend && npm install && cd ..

# Install backend dependencies
cd backend && npm install && cd ..

# Set up Python AI service
cd ai-service
python -m venv venv
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate
pip install -r requirements.txt
cd ..
```

### Step 2: Set Up Environment Variables

**Frontend:**
```bash
cd frontend
# Copy .env.example to .env (if exists)
# Or create .env with:
# NEXT_PUBLIC_API_URL=http://localhost:5000/api
cd ..
```

**Backend:**
```bash
cd backend
# Create .env file with:
# PORT=5000
# MONGODB_URI=your-mongodb-uri
# JWT_SECRET=your-secret-key
# AI_SERVICE_URL=http://localhost:8000
cd ..
```

**AI Service:**
```bash
cd ai-service
# Create .env file with:
# OPENAI_API_KEY=your-openai-key
# MODEL_NAME=gpt-4
cd ..
```

### Step 3: Start Development

**Option A: Run All Services (Recommended)**
```bash
npm run dev:all
```

**Option B: Run Individually**

Terminal 1 (Frontend):
```bash
cd frontend && npm run dev
```

Terminal 2 (Backend):
```bash
cd backend && npm run dev
```

Terminal 3 (AI Service):
```bash
cd ai-service
venv\Scripts\activate  # Windows
# or: source venv/bin/activate  # Mac/Linux
uvicorn main:app --reload --port 8000
```

### Step 4: Verify Everything Works

1. **Frontend:** http://localhost:3000
2. **Backend:** http://localhost:5000/api/health
3. **AI Service:** http://localhost:8000/health

## 🎯 Team-Specific Quick Starts

### For Nicolette (AI Service)
```bash
cd ai-service
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```
Then start implementing in `services/digital_twin.py` and `services/simulation_engine.py`

### For Lunga (Backend)
```bash
cd backend
npm install
npm run dev
```
Then start implementing routes in `routes/` and models in `models/`

### For Eva & Siyanda (Frontend)
```bash
cd frontend
npm install
npm run dev
```
Then start building components in `components/` and pages in `app/`

## 📝 Common Issues

### Port Already in Use
- Change port in `.env` or config files
- Or stop the process using that port

### MongoDB Connection Error
- Check your `MONGODB_URI` in `backend/.env`
- Ensure MongoDB Atlas allows your IP

### Python Module Not Found
- Activate virtual environment: `venv\Scripts\activate`
- Install requirements: `pip install -r requirements.txt`

### Frontend Build Errors
- Delete `node_modules` and `.next` folder
- Run `npm install` again

## 🆘 Need Help?

- Check `docs/TEAM_WORKFLOW.md` for workflow guidelines
- Check `docs/API_DOCUMENTATION.md` for API reference
- Ask in team chat or tag @Nicolette

