
# Economic Twin Chat Service

## Overview

The **Twin Chat Service** is responsible for enriching a user's Economic Twin through AI-driven conversation before persistence.

Unlike traditional systems that save data immediately after CV analysis, this service introduces a **two-phase intelligence flow**:

1. Build raw twin data (from CV analysis)
2. Refine and enrich it through chat interaction
3. Persist only the final, improved version

This ensures higher accuracy, personalization, and data quality.

---

## Architecture Flow

```

CV Analysis → Twin Builder → Chat (AI + User) → Enriched Twin → Persist

````

---

## Core Responsibilities

- Initialize chat sessions with computed twin data
- Convert twin data into AI-compatible context
- Handle chat communication with FastAPI AI service
- Merge AI responses back into the twin
- Persist the final twin only when chat is complete

---

## Key Methods

### 1. `initialiseChatSession(userId)`

Builds the initial twin data from CV analysis without saving it.

**Flow:**
- Calls `twinBuilderService.buildTwinData(userId)`
- Returns enriched twin structure for chat use

**Returns:**
```json
{
  "twinData": { ... }
}
````

---

### 2. `sendMessage(userId, message, history, twinData, isLastPrompt)`

Handles chat interaction with AI and updates the twin in-memory.

**Responsibilities:**

* Prevent duplicate messages in history
* Transform twin data into AI-compatible format
* Call FastAPI `/chat/twin`
* Gracefully handle AI failures
* Merge AI response into twin
* Persist twin if conversation is complete

---

## Internal Helpers

### `_buildCvContext(twinData)`

Transforms twin data into a format expected by the AI service.

Supports:

* Raw twin structure (`identity`, `economy`, `skills`)
* Normalized structure (`profile`, `skills[]`, `gaps`)

**Key Output Fields:**

* identity (role, industry, seniority)
* economy (scores, demand)
* skills (core + missing)
* intelligence (strengths, weaknesses)
* market insights (trending skills, opportunities)

---

### `_mergeFastApiResponse(twinData, fastApiData)`

Merges AI-generated profile updates into the twin.

**Updates:**

* Seniority level
* Industry
* Employability score
* Market value
* Skills
* Confidence score

Also:

* Tracks evolution (`lastUpdatedBy: 'twin_chat'`)
* Stores AI profile temporarily (`_chatProfile`)

---

### `_mapCareerStageToSeniority(careerStage)`

Maps AI career stages to system-defined levels:

| AI Stage    | System Level |
| ----------- | ------------ |
| Early       | JUNIOR       |
| Mid         | MID          |
| Established | SENIOR       |

---

## AI Integration

### Endpoint

```
POST /chat/twin
```

### Payload

```json
{
  "messages": [...],
  "cv_context": { ... },
  "focus": "growth"
}
```

### Response

```json
{
  "reply": "string",
  "options": [],
  "isComplete": boolean,
  "profile": { ... }
}
```

---

## Persistence Strategy

The twin is only saved when:

* `isLastPrompt === true`
  **OR**
* `fastApiData.isComplete === true`

### Why?

Saving immediately after CV analysis leads to:

* Incomplete data
* Poor personalization
* Low-quality insights

This delayed persistence ensures:

* AI refinement
* User-driven context
* Higher confidence scores

---

## Error Handling

### AI Failure

* Logs warning
* Returns fallback message
* Prevents system crash

### DB Failure

* Logs warning
* Continues execution
* Returns response without persistence

---

## Data Flow Example

```
User sends message
   ↓
Build CV context from twin
   ↓
Send to AI service
   ↓
Receive enriched response
   ↓
Merge into twin
   ↓
If final → Save to DB
```

---

## Strengths of This Design

* Prevents premature data storage
* Enables AI + human collaboration
* Improves data quality over time
* Supports flexible twin structures
* Resilient to AI or DB failures

---

## Limitations

* Heavy reliance on AI service availability
* Static scoring logic (in Twin Builder)
* Default fallbacks may reduce personalization

---

## Future Improvements

* Adaptive scoring using ML
* Retry strategy for AI failures
* Real-time learning from user corrections
* Analytics on chat effectiveness
* Versioning of twin evolution

---

## Summary

The Twin Chat Service transforms the Economic Twin from a **static CV-based snapshot** into a **dynamic, intelligent, and user-refined career model**.

It is the bridge between:

* Raw data (CV)
* Intelligence (AI)
* Real-world decisions (career growth)

