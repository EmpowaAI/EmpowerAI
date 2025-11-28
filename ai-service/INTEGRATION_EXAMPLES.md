# AI Service Integration Examples

Quick reference for integrating with the AI service.

## Node.js/Express Examples

### Setup

```javascript
const axios = require('axios');
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';
```

### 1. Digital Twin Generation

```javascript
// Generate twin for a user
async function createTwin(user) {
  const response = await axios.post(`${AI_SERVICE_URL}/api/twin/generate`, {
    name: user.name,
    age: user.age,
    province: user.province,
    skills: user.skills,
    education: user.education,
    experience: user.experience
  });
  return response.data;
}
```

### 2. Path Simulation

```javascript
// Simulate all paths
async function simulateAllPaths(user) {
  const response = await axios.post(`${AI_SERVICE_URL}/api/simulation/paths`, {
    name: user.name,
    age: user.age,
    province: user.province,
    skills: user.skills,
    education: user.education
  });
  return response.data;
}

// Get best path
async function getBestPath(user) {
  const response = await axios.post(`${AI_SERVICE_URL}/api/simulation/best-path`, {
    name: user.name,
    age: user.age,
    province: user.province,
    skills: user.skills,
    education: user.education
  });
  return response.data;
}
```

### 3. CV Analysis

```javascript
// Analyze CV
async function analyzeCV(cvText, jobRequirements) {
  const response = await axios.post(`${AI_SERVICE_URL}/api/cv/analyze`, {
    cvText: cvText,
    jobRequirements: jobRequirements || null
  });
  return response.data;
}
```

### 4. Interview Coach

```javascript
// Start interview
async function startInterview(type, difficulty) {
  const response = await axios.post(`${AI_SERVICE_URL}/api/interview/start`, {
    type: type, // 'tech', 'behavioral', or 'non-tech'
    difficulty: difficulty // 'easy', 'medium', or 'hard'
  });
  return response.data;
}

// Submit answer
async function submitAnswer(sessionId, questionId, answer) {
  const response = await axios.post(
    `${AI_SERVICE_URL}/api/interview/${sessionId}/answer`,
    {
      questionId: questionId,
      response: answer
    }
  );
  return response.data;
}
```

## Python Examples

```python
import requests

AI_SERVICE_URL = "http://localhost:8000"

# Generate twin
def generate_twin(user_data):
    response = requests.post(
        f"{AI_SERVICE_URL}/api/twin/generate",
        json=user_data
    )
    return response.json()

# Simulate paths
def simulate_paths(user_data):
    response = requests.post(
        f"{AI_SERVICE_URL}/api/simulation/paths",
        json=user_data
    )
    return response.json()
```

## cURL Examples

```bash
# Health check
curl http://localhost:8000/health

# Generate twin
curl -X POST http://localhost:8000/api/twin/generate \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Asanda",
    "age": 22,
    "province": "Gauteng",
    "skills": ["communication", "teamwork"],
    "education": "Matric"
  }'

# Analyze CV
curl -X POST http://localhost:8000/api/cv/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "cvText": "CV content here...",
    "jobRequirements": ["Python", "JavaScript"]
  }'
```

