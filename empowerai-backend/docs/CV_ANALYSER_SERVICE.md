
# CV Analysis Service

## Overview

The **CV Analysis Service** is responsible for extracting, analyzing, and persisting structured career intelligence from user CVs.

It supports:
- Text-based CV analysis
- File-based CV uploads (PDF, DOCX, etc.)
- AI-powered insights
- Fallback processing when AI is unavailable
- CV revamp (AI enhancement)
- Profile restoration from cached frontend data

This service acts as the **entry point of the Economic Twin pipeline**.

---

## Architecture Role

```

CV Input → AI Analysis → CvProfile → Twin Builder → Twin Chat → Economic Twin

````

The output of this service feeds directly into the **Twin Builder Service**.

---

## Core Responsibilities

- Extract CV content (text or file)
- Send data to AI service for analysis
- Handle rate limits and service failures
- Generate fallback analysis when needed
- Persist structured CV profiles
- Provide CV revamp functionality
- Restore lost profiles from cached data

---

## Key Methods

---

### 1. `analyzeFromText({ userId, cvText, jobRequirementsArray })`

Analyzes a CV provided as plain text.

**Flow:**
1. Sends CV text to AI service (`/cv/analyze`)
2. Uses queue system (`runAiTask`) for async handling
3. Retries on rate limits
4. Saves result to database

**Returns:**
```json
{
  "analysis": {},
  "profileId": "string",
  "isFallback": false,
  "meta": {
    "jobId": "string",
    "queued": true
  }
}
````

---

### 2. `analyzeFromFile({ userId, file, jobRequirementsArray })`

Analyzes uploaded CV files.

**Flow:**

1. Converts file buffer → base64
2. Sends as multipart form-data to AI service
3. Handles large file limits (10MB)
4. Falls back to text extraction if needed

**Key Features:**

* Handles PDFs, DOCX, etc.
* Supports retry logic
* Handles extraction failures

---

### 3. `saveAnalysisResult(...)`

Persists CV analysis results into the database.

**Stored Fields:**

* File metadata (name, size, type)
* Raw extracted text
* AI analysis output
* Fallback flag

---

### 4. `revampCv({ cvData })`

Generates an improved version of a CV using AI.

**Endpoint Used:**

```
POST /cv/revamp
```

**Use Case:**

* Enhance CV quality
* Improve structure and wording
* Optimize for job market

---

### 5. `restoreFromCachedAnalysis({ userId, cachedAnalysis })`

Reconstructs a CV profile from frontend cached data.

**Why this exists:**

* Prevents forcing users to re-upload CVs
* Recovers from backend persistence failures

---

### 6. `getCvProfile(userId)`

Fetches user's CV profile.

---

### 7. `hasCompleteProfile(userId)`

Checks if user has a fully processed CV profile.

---

### 8. `deleteCvProfile(userId)`

Deletes user CV profile from database.

---

## AI Integration

### Text Analysis

```
POST /cv/analyze
```

### File Analysis

```
POST /api/cv/analyze-file
```

### Revamp

```
POST /cv/revamp
```

---

## Queue System

All AI calls go through:

```
runAiTask()
```

### Benefits:

* Async processing
* Timeout control
* Job tracking
* Retry handling

---

## Error Handling Strategy

### 1. Rate Limiting (429)

* Waits and retries
* Falls back if limit persists

---

### 2. AI Service Down

Handles:

* ECONNREFUSED
* ETIMEDOUT
* ENOTFOUND
* 5xx errors

**Fallback:**

* Generates basic CV analysis using:

```
buildFallbackAnalysis()
```

---

### 3. File Extraction Failure (400)

If Python fails:

* Uses Node-based extraction (`pdf-parse`)
* Retries analysis with extracted text

---

## Fallback System

When AI fails, the system:

1. Extracts raw text (if possible)
2. Generates basic analysis
3. Saves it as `isFallback: true`

**User still gets value instead of failure.**

---

## Data Model (Simplified)

```json
{
  "userId": "string",
  "filename": "string",
  "rawText": "string",
  "analysis": {
    "score": number,
    "industry": "string",
    "readinessLevel": "string",
    "extractedSkills": [],
    "missingSkills": [],
    "strengths": [],
    "weaknesses": [],
    "recommendations": []
  },
  "isFallback": boolean
}
```

---

## Strengths of This Design

* Resilient to AI downtime
* Supports multiple input formats
* Queue-based scalability
* Graceful degradation (fallback system)
* Prevents data loss (restore feature)

---

## Limitations

* Heavy dependency on AI service
* File parsing may fail on complex PDFs
* Fallback analysis is less accurate
* Large file uploads may hit limits

---

## Future Improvements

* Streaming AI responses (real-time feedback)
* Improved PDF parsing (OCR integration)
* Smarter fallback logic (ML-based)
* Caching AI responses
* Parallel processing for large CVs

---

## Summary

The CV Analysis Service is the **foundation of the entire system**.

It transforms unstructured CV data into structured intelligence that powers:

* Opportunity matching
* Economic Twin generation
* Career simulations
* AI-driven chat insights

