

# 🤖 AI Service (EmpowerAI)

## Overview

The **AI Service** is the core intelligence layer of EmpowerAI.
It acts as a bridge between the Node.js backend and the Python-based AI engine, handling:

* CV analysis
* Job matching intelligence
* AI-generated insights
* Prompt-based processing
* OpenAI integration (or alternative LLMs)

It is designed to be **fast, resilient, and cloud-friendly**, with built-in support for:

* cold starts (Render free tier)
* rate limits
* retries
* health monitoring

---

## 🧠 Architecture

```text
Frontend
   ↓
Node.js Backend
   ↓
AI Service Client (Axios Layer)
   ↓
Python AI Service (FastAPI / Flask)
   ↓
OpenAI / LLM Provider
```

The AI Service is intentionally **decoupled** so it can scale independently from the main backend.

---

## 🚀 Features

### Core AI Capabilities

* CV parsing & analysis
* Job recommendation matching
* AI-generated career insights
* Natural language processing endpoints
* Structured AI response formatting

### Reliability Features

* Retry logic with exponential backoff
* Circuit breaker protection
* Timeout handling
* Cold start detection (Render support)
* Request tracing (Request ID support)

### Monitoring

* Health check endpoint (`/health`)
* OpenAI backend status reporting
* Cached health state for performance optimization

---

## 📡 Base URL

```env
AI_SERVICE_URL=http://localhost:8000
```

Production example:

```env
AI_SERVICE_URL=https://your-ai-service.onrender.com
```

---

## 🔐 Authentication

If enabled:

```http
X-API-KEY: your-secret-key
```

---

## 📊 API Endpoints

---

### 🟢 Health Check

```http
GET /health
```

Response:

```json
{
  "status": "healthy",
  "openai_status": "connected"
}
```

---

### 🧠 CV Analysis

```http
POST /api/analyze-cv
```

Request:

```json
{
  "cvText": "John is a software developer with React experience..."
}
```

Response:

```json
{
  "skills": ["React", "Node.js"],
  "recommendations": ["Improve backend skills"],
  "jobMatches": ["Frontend Developer"]
}
```

---

### 💼 Job Matching

```http
POST /api/match-jobs
```

Request:

```json
{
  "skills": ["React", "TypeScript"],
  "experience": "junior"
}
```

---

### 🤖 AI Prompt Processing

```http
POST /api/prompt
```

Request:

```json
{
  "prompt": "Explain microservices architecture"
}
```

---

## 🩺 Health System

The service exposes a robust health monitoring system.

### Status Types

| Status       | Meaning                         |
| ------------ | ------------------------------- |
| connected    | AI service fully operational    |
| unhealthy    | Service responding but degraded |
| sleeping     | Cold start / Render waking up   |
| disconnected | Service unreachable             |

---

### Cached Health State

To prevent overload, health results are cached:

* Cache duration: **5 minutes**
* Reduces unnecessary `/health` calls
* Improves performance under load

---

## ⚙️ Environment Variables

```env
# AI Service Core
AI_SERVICE_URL=http://localhost:8000
AI_SERVICE_API_KEY=your_api_key

# Performance
AI_HEALTH_TIMEOUT_MS=15000
AI_HEALTH_STALE_MS=300000

# Environment
NODE_ENV=production
```

---

## 🔁 Reliability Design

### Retry Strategy

* Only retries on:

  * network failures
  * timeouts
* Uses exponential backoff:

  ```
  2s → 4s → 8s
  ```

---

### Circuit Breaker

Prevents cascading failures when AI service is unstable:

* Opens after repeated failures
* Blocks requests temporarily
* Auto-recovers after cooldown

---

### Cold Start Handling

Optimized for platforms like Render:

* Detects timeout patterns
* Marks service as “sleeping”
* Provides user-friendly messages

---

## 📦 Integration (Node.js Backend)

Example usage with AI client:

```javascript
const aiClient = require('./services/aiClient');

const response = await aiClient.post('/analyze-cv', {
  cvText: userCv
});
```

---

## 🧪 Startup Health Check

Automatically runs on backend startup:

```javascript
pingAiServiceOnStartup();
```

Logs:

* service availability
* OpenAI status
* connection failures

---

## 📉 Failure Handling Strategy

| Scenario       | Behavior                     |
| -------------- | ---------------------------- |
| Timeout        | Retry with backoff           |
| 429 Rate Limit | No retry (prevents overload) |
| 503 Cold Start | User-friendly retry message  |
| 500 Error      | Controlled failure response  |
| Network Error  | Retry + fallback error       |

---

## 🔍 Logging

Structured logging includes:

* Request ID tracking
* Response time metrics
* Error categorization
* AI service state transitions

---

## 🛠 Tech Stack

* Python (FastAPI / Flask)
* OpenAI API / LLM Provider
* Node.js (consumer layer)
* Axios (communication layer)

---

## 🚀 Future Improvements

* [ ] Add Redis caching layer for AI responses
* [ ] Add streaming responses (SSE / WebSockets)
* [ ] Add request queue system (BullMQ / Celery)
* [ ] Add model switching (OpenAI / local LLM fallback)
* [ ] Add observability dashboard (Prometheus + Grafana)
* [ ] Add semantic caching for repeated prompts

---

## ⚠️ Notes

* AI service may experience cold starts on free hosting tiers
* First request after inactivity may take 30–60 seconds
* Health caching reduces unnecessary load on service

