# API Documentation

## Backend API (Node.js/Express)

Base URL: `http://localhost:5000/api`

### Authentication

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "Asanda",
  "email": "asanda@example.com",
  "age": 22,
  "province": "Gauteng",
  "education": "Matric",
  "skills": ["communication", "teamwork"],
  "password": "securepassword"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "asanda@example.com",
  "password": "securepassword"
}
```

### Digital Twin

#### Create Twin
```http
POST /api/twin/create
Authorization: Bearer <token>
Content-Type: application/json

{
  "userId": "user_id_here"
}
```

#### Get Twin
```http
GET /api/twin/:userId
Authorization: Bearer <token>
```

### Simulation

#### Run Simulation
```http
POST /api/simulation/run
Authorization: Bearer <token>
Content-Type: application/json

{
  "twinId": "twin_id_here",
  "pathIds": ["learnership", "freelancing"]
}
```

### CV Analysis

#### Analyze CV
```http
POST /api/cv/analyze
Authorization: Bearer <token>
Content-Type: multipart/form-data

cv: <file>
```

### Opportunities

#### Get Opportunities
```http
GET /api/opportunities?province=Gauteng&type=learnership
Authorization: Bearer <token>
```

## AI Service API (FastAPI)

Base URL: `http://localhost:8000/api`

### Digital Twin

#### Generate Twin
```http
POST /api/twin/generate
Content-Type: application/json

{
  "userData": {
    "name": "Asanda",
    "age": 22,
    "province": "Gauteng",
    "skills": ["communication"],
    "education": "Matric"
  }
}
```

### Simulation

#### Simulate Paths
```http
POST /api/simulation/paths
Content-Type: application/json

{
  "twinData": {...},
  "pathIds": ["learnership", "freelancing"]
}
```

### CV Analysis

#### Analyze CV Text
```http
POST /api/cv/analyze
Content-Type: application/json

{
  "cvText": "CV content here...",
  "jobRequirements": ["Python", "JavaScript"]
}
```

### Interview Coach

#### Start Interview
```http
POST /api/interview/start
Content-Type: application/json

{
  "type": "tech",
  "difficulty": "medium"
}
```

#### Submit Answer
```http
POST /api/interview/:sessionId/answer
Content-Type: application/json

{
  "questionId": "q1",
  "response": "User's answer here..."
}
```

