# Backend Integration Guide

**For Lunga (Backend Developer)**

This guide shows how to integrate the Node.js/Express backend with the AI Service.

## AI Service Endpoints

The AI service runs on `http://localhost:8000` (or your deployed URL).

### Base URL
```
http://localhost:8000/api
```

## Integration Examples

### 1. Generate Digital Twin

**Endpoint:** `POST /api/twin/generate`

**Request:**
```javascript
const axios = require('axios');

async function generateTwin(userData) {
  try {
    const response = await axios.post('http://localhost:8000/api/twin/generate', {
      name: userData.name,
      age: userData.age,
      province: userData.province,
      skills: userData.skills || [],
      education: userData.education,
      interests: userData.interests || [],
      experience: userData.experience || null
    });
    
    return response.data;
  } catch (error) {
    console.error('Error generating twin:', error.response?.data || error.message);
    throw error;
  }
}

// Usage
const twin = await generateTwin({
  name: "Asanda",
  age: 22,
  province: "Gauteng",
  skills: ["communication", "teamwork"],
  education: "Matric",
  experience: "6 months retail work"
});

console.log('Empowerment Score:', twin.empowermentScore);
console.log('Recommended Paths:', twin.growthModel.recommendedPaths);
```

**Response:**
```json
{
  "skillVector": [0.6, 0.7, 0.5, 0.6, 0.5, 0.4],
  "incomeProjection": {
    "threeMonth": 3200.0,
    "sixMonth": 3600.0,
    "twelveMonth": 4400.0
  },
  "empowermentScore": 65.5,
  "growthModel": {
    "skillGrowth": [0.72, 0.84, 0.6, 0.72, 0.6, 0.48],
    "employabilityIndex": 0.65,
    "recommendedPaths": ["learnership", "short_course", "freelancing"]
  }
}
```

### 2. Run Path Simulations

**Endpoint:** `POST /api/simulation/paths`

**Request:**
```javascript
async function simulatePaths(userData, pathIds = null) {
  try {
    const url = 'http://localhost:8000/api/simulation/paths';
    const payload = {
      name: userData.name,
      age: userData.age,
      province: userData.province,
      skills: userData.skills || [],
      education: userData.education
    };
    
    // Optional: specify path IDs
    if (pathIds) {
      payload.pathIds = pathIds;
    }
    
    const response = await axios.post(url, payload);
    return response.data;
  } catch (error) {
    console.error('Error simulating paths:', error.response?.data || error.message);
    throw error;
  }
}

// Simulate all paths
const allPaths = await simulatePaths(userData);

// Simulate specific paths
const specificPaths = await simulatePaths(userData, ['learnership', 'freelancing']);
```

**Response:**
```json
[
  {
    "pathId": "learnership",
    "pathName": "Learnership Program",
    "description": "Structured learnership program with stipend",
    "projections": {
      "threeMonth": {
        "income": 3500.0,
        "skillGrowth": 0.65,
        "employabilityIndex": 0.55,
        "milestones": ["Complete learnership orientation"]
      },
      "sixMonth": {
        "income": 3800.0,
        "skillGrowth": 0.75,
        "employabilityIndex": 0.65,
        "milestones": ["Begin practical workplace experience"]
      },
      "twelveMonth": {
        "income": 4200.0,
        "skillGrowth": 0.85,
        "employabilityIndex": 0.75,
        "milestones": ["Complete learnership program", "Qualify for permanent employment"]
      }
    }
  }
]
```

### 3. Get Best Path

**Endpoint:** `POST /api/simulation/best-path`

**Request:**
```javascript
async function getBestPath(userData) {
  try {
    const response = await axios.post(
      'http://localhost:8000/api/simulation/best-path',
      {
        name: userData.name,
        age: userData.age,
        province: userData.province,
        skills: userData.skills || [],
        education: userData.education
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error getting best path:', error.response?.data || error.message);
    throw error;
  }
}
```

### 4. Analyze CV

**Endpoint:** `POST /api/cv/analyze`

**Request:**
```javascript
async function analyzeCV(cvText, jobRequirements = null) {
  try {
    const payload = {
      cvText: cvText
    };
    
    if (jobRequirements) {
      payload.jobRequirements = jobRequirements;
    }
    
    const response = await axios.post(
      'http://localhost:8000/api/cv/analyze',
      payload
    );
    return response.data;
  } catch (error) {
    console.error('Error analyzing CV:', error.response?.data || error.message);
    throw error;
  }
}

// Usage
const analysis = await analyzeCV(
  "CV text content here...",
  ["Python", "JavaScript", "Communication"]
);
```

**Response:**
```json
{
  "extractedSkills": ["communication", "teamwork", "customer service"],
  "missingSkills": ["Python", "JavaScript"],
  "suggestions": [
    "Add experience or training in Python to improve job fit",
    "Consider learning JavaScript for web development roles",
    "Highlight your achievements and quantifiable results"
  ]
}
```

### 5. Interview Coach

**Start Interview:**
```javascript
async function startInterview(type, difficulty = 'medium', company = null) {
  try {
    const payload = {
      type: type, // 'tech', 'non-tech', or 'behavioral'
      difficulty: difficulty,
      company: company
    };
    
    const response = await axios.post(
      'http://localhost:8000/api/interview/start',
      payload
    );
    return response.data;
  } catch (error) {
    console.error('Error starting interview:', error.response?.data || error.message);
    throw error;
  }
}

// Usage
const session = await startInterview('behavioral', 'medium');
console.log('Session ID:', session.sessionId);
console.log('Questions:', session.questions);
```

**Submit Answer:**
```javascript
async function submitAnswer(sessionId, questionId, response) {
  try {
    const answerResponse = await axios.post(
      `http://localhost:8000/api/interview/${sessionId}/answer`,
      {
        questionId: questionId,
        response: response
      }
    );
    return answerResponse.data;
  } catch (error) {
    console.error('Error submitting answer:', error.response?.data || error.message);
    throw error;
  }
}

// Usage
const feedback = await submitAnswer(
  session.sessionId,
  session.questions[0].id,
  "I worked in a team during my retail job..."
);
console.log('Score:', feedback.score);
console.log('Feedback:', feedback.feedback);
```

## Backend Route Examples

### Example: Create Twin Route

```javascript
// routes/twin.js
const express = require('express');
const axios = require('axios');
const router = express.Router();

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

router.post('/create', async (req, res) => {
  try {
    const { userId } = req.body;
    
    // Get user data from database
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Call AI service
    const twinResponse = await axios.post(
      `${AI_SERVICE_URL}/api/twin/generate`,
      {
        name: user.name,
        age: user.age,
        province: user.province,
        skills: user.skills,
        education: user.education,
        experience: user.experience
      }
    );
    
    // Save twin to database
    const twin = new EconomicTwin({
      userId: user._id,
      skillVector: twinResponse.data.skillVector,
      incomeProjection: twinResponse.data.incomeProjection,
      empowermentScore: twinResponse.data.empowermentScore,
      growthModel: twinResponse.data.growthModel
    });
    
    await twin.save();
    
    res.json(twin);
  } catch (error) {
    console.error('Error creating twin:', error);
    res.status(500).json({ 
      error: 'Failed to create twin',
      details: error.response?.data || error.message 
    });
  }
});

module.exports = router;
```

### Example: Run Simulation Route

```javascript
// routes/simulation.js
const express = require('express');
const axios = require('axios');
const router = express.Router();

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

router.post('/run', async (req, res) => {
  try {
    const { twinId, pathIds } = req.body;
    
    // Get twin from database
    const twin = await EconomicTwin.findById(twinId);
    if (!twin) {
      return res.status(404).json({ error: 'Twin not found' });
    }
    
    // Get user data
    const user = await User.findById(twin.userId);
    
    // Call AI service
    const simulationResponse = await axios.post(
      `${AI_SERVICE_URL}/api/simulation/paths`,
      {
        name: user.name,
        age: user.age,
        province: user.province,
        skills: user.skills,
        education: user.education
      },
      {
        params: pathIds ? { pathIds: pathIds.join(',') } : {}
      }
    );
    
    res.json(simulationResponse.data);
  } catch (error) {
    console.error('Error running simulation:', error);
    res.status(500).json({ 
      error: 'Failed to run simulation',
      details: error.response?.data || error.message 
    });
  }
});

module.exports = router;
```

## Error Handling

The AI service returns standard HTTP status codes:

- `200` - Success
- `400` - Bad Request (invalid input)
- `404` - Not Found (session not found, etc.)
- `500` - Internal Server Error

Always wrap AI service calls in try-catch blocks:

```javascript
try {
  const result = await axios.post(`${AI_SERVICE_URL}/api/twin/generate`, data);
  return result.data;
} catch (error) {
  if (error.response) {
    // AI service returned an error
    console.error('AI Service Error:', error.response.status, error.response.data);
    throw new Error(`AI Service: ${error.response.data.detail || error.response.data.message}`);
  } else if (error.request) {
    // Request made but no response
    console.error('No response from AI Service');
    throw new Error('AI Service is unavailable');
  } else {
    // Error setting up request
    console.error('Error:', error.message);
    throw error;
  }
}
```

## Environment Variables

Add to your `.env` file:

```env
AI_SERVICE_URL=http://localhost:8000
```

For production:
```env
AI_SERVICE_URL=https://your-ai-service-url.com
```

## Testing

Test the AI service connection:

```javascript
// Test health endpoint
async function testAIService() {
  try {
    const response = await axios.get(`${AI_SERVICE_URL}/health`);
    console.log('AI Service Status:', response.data);
    return true;
  } catch (error) {
    console.error('AI Service is not available');
    return false;
  }
}
```

## Notes

- The AI service works without OpenAI API key (fallback mode)
- Response times should be < 4 seconds
- All endpoints return JSON
- CORS is enabled for localhost:3000 and localhost:5000

