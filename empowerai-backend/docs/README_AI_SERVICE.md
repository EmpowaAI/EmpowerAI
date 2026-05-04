
# 🤖 AI Service (EmpowerAI)

## Overview

The **AI Service** is the intelligence backbone of EmpowerAI.
It powers advanced features like CV analysis, job matching, personalized AI twins, and interview coaching.

This service is designed as a **decoupled microservice system**, enabling independent scaling, resilience, and flexibility.

---

## 🧠 Core Capabilities

### 🎯 AI Features

* ✅ CV Analysis (skills, experience extraction)
* ✅ Job Matching Engine
* ✅ AI Twin Builder (personalized user intelligence model)
* ✅ Interview Coach (mock interviews + feedback)
* ✅ AI Insights Engine (career recommendations)
* ✅ Prompt Processing (custom AI queries)

---

## 🏗️ System Architecture

Below is the full system architecture:

![AI Service Architecture](sandbox:/mnt/data/a_clean_infographic_diagram_in_a_landscape_layout.png)

---

## 🧩 Architecture Breakdown

### 1. Client Layer

* Web App
* Mobile App

Initiates requests such as:

* CV upload
* Job search
* Interview simulation

---

### 2. Node.js Backend (API Server)

Handles:

* Routing & controllers
* Business logic
* Authentication (JWT / API keys)
* Logging & monitoring

Includes:

* AI Service Client (Axios layer)
* Health Check Service
* Caching layer (Redis optional)

---

### 3. AI Service Client (Critical Layer)

This is your **resilience layer**.

Features:

* Request interceptors (logging, request ID)
* Timeout handling (30s dev / 90s prod)
* Retry logic (exponential backoff)
* Circuit breaker protection
* Cold start awareness (Render support)
* Rate limit handling (429 safe)

---

### 4. Python AI Service (FastAPI)

Core intelligence engine.

#### Modules:

* **CV Analyzer**

  * Extracts structured data from CVs

* **Job Matcher**

  * Matches candidates to roles

* **AI Twin Builder**

  * Builds personalized AI profile per user

* **Interview Coach**

  * Simulates interviews and provides feedback

* **AI Insights Engine**

  * Generates career advice & recommendations

* **Prompt Processor**

  * Handles custom AI queries

---

### 5. AI / LLM Providers

Supports multiple providers:

* OpenAI
* Anthropic
* Google Gemini
* Mistral
* Local models (optional)

---

## 🔁 Request Flow

```text
Client → Backend → AI Client → Python AI Service → LLM → Response
```

---

## 🩺 Health Monitoring

### Endpoint

```http
GET /health
```

### Status Types

| Status       | Meaning             |
| ------------ | ------------------- |
| connected    | Fully operational   |
| sleeping     | Cold start (Render) |
| disconnected | Service unreachable |
| unhealthy    | Service degraded    |

---

### Health Strategy

* Cached for 5 minutes
* Timeout detection
* Cold start awareness
* Startup ping check

---

## ⚙️ Environment Variables

```env
AI_SERVICE_URL=https://your-ai-service.onrender.com
AI_SERVICE_API_KEY=your_api_key

AI_HEALTH_TIMEOUT_MS=15000
AI_HEALTH_STALE_MS=300000

NODE_ENV=production
```

---

## 🔐 Security

* API key authentication (`X-API-KEY`)
* JWT authentication (backend layer)
* Input validation before AI calls
* No sensitive data exposed in responses

---

## 🔁 Reliability Design

### Retry Logic

* Retries only on:

  * timeouts
  * network failures

Backoff:

```text
2s → 4s → 8s
```

---

### Circuit Breaker

Prevents overload when AI service is failing:

* Stops requests after repeated failures
* Automatically recovers

---

### Cold Start Handling

Optimized for platforms like Render:

* Detects sleeping services
* Returns user-friendly messages
* Avoids unnecessary retries

---

## 📦 Integration Example

```javascript
const aiClient = require('./services/aiClient');

const result = await aiClient.post('/analyze-cv', {
  cvText: userCv
});
```

---

## 🧪 Startup Health Check

```javascript
pingAiServiceOnStartup();
```

Runs once at server start to:

* verify AI availability
* log OpenAI status
* detect cold starts

---

## 📊 Observability

Includes:

* Structured logging
* Request ID tracing
* Error classification
* Performance timing
* Health status tracking

---

## 📉 Failure Handling

| Scenario      | Behavior                    |
| ------------- | --------------------------- |
| Timeout       | Retry                       |
| 429           | No retry (prevent overload) |
| 503           | Cold start message          |
| 500           | Controlled failure          |
| Network error | Retry + fallback            |

---

## 🛠 Tech Stack

* Node.js (API layer)
* Python (FastAPI AI service)
* Axios (communication)
* OpenAI / LLM providers
* Redis (optional caching)
* Winston (logging)

---

## 🚀 Future Improvements

* [ ] Queue system (BullMQ / Celery)
* [ ] Streaming responses (SSE / WebSockets)
* [ ] Multi-model fallback
* [ ] AI response caching (Redis)
* [ ] Observability dashboard (Grafana)
* [ ] Rate limiting per user
* [ ] AI cost tracking

---

## ⚠️ Notes

* First request may take 30–60 seconds (cold start)
* Health caching prevents unnecessary load
* Designed for horizontal scaling

---

## 🧠 Final Perspective

This isn’t just an API.

It’s a **distributed AI system** with:

* resilience under failure
* intelligence at scale
* modular architecture
