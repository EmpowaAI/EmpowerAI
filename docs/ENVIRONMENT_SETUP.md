# Environment Setup Guide

## Prerequisites

- Node.js 18+
- Python 3.10+
- MongoDB Atlas connection string
- OpenAI or Azure OpenAI key

## 1) Frontend env (`frontend/.env`)

```env
VITE_API_URL=http://localhost:5000/api
```

## 2) Backend env (`empowerai-backend/.env`)

```env
PORT=5000
MONGODB_URI=your_mongodb_uri
JWT_SECRET=replace_with_strong_secret
AI_SERVICE_URL=http://localhost:8000/api
FRONTEND_URL=http://localhost:5173
BREVO_API_KEY=your_brevo_api_key
```

## 3) AI service env (`ai-service/.env`)

```env
OPENAI_API_KEY=your_openai_api_key
BACKEND_URL=http://localhost:5000/api
```

## 4) Boot sequence

1. `npm run install:all`
2. `npm run dev:all`
3. Verify frontend on `http://localhost:5173`
4. Verify backend health route and AI service logs

## Troubleshooting

- If backend cannot reach AI service, confirm `AI_SERVICE_URL` and AI process is running.
- If CORS errors appear, verify `FRONTEND_URL` matches the active frontend URL.
- If auth fails unexpectedly, rotate `JWT_SECRET` and clear old tokens.