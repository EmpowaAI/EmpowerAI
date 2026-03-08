# EmpowerAI Architecture Diagram

```mermaid
flowchart TD
    U[User Browser] --> F[Frontend: React + Vite]
    F -->|REST API| B[Backend: Express API]
    B -->|HTTP| A[AI Service: FastAPI]
    B --> D[(MongoDB Atlas)]
    A --> O[OpenAI / Azure OpenAI]

    subgraph Frontend
      F1[Pages]
      F2[UI Components]
      F3[API Client]
    end

    subgraph Backend
      B1[Routes]
      B2[Controllers]
      B3[Services]
    end

    F --> F1
    F --> F2
    F --> F3
    B --> B1
    B --> B2
    B --> B3
```

## Notes

- Frontend talks only to backend APIs.
- Backend handles auth, persistence, and orchestrates AI calls.
- AI service handles prompt-heavy CV/twin/interview workloads.