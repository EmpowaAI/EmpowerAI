# Security & Data Storage Overview

This document outlines where user data is stored within the EmpowerAI platform, focusing on security and privacy considerations, particularly for sensitive information like CVs.

---

## Where User Data is Stored

### 1. MongoDB (Backend)

The primary persistent data store for the `empowerai-backend` service is MongoDB, configured via `MONGODB_URI`.

*   **`User` Documents (`empowerai-backend/src/models/User.js`)**:
    *   **Sensitive**: `name`, `email`, `password` (stored as a bcrypt hash).
    *   **Optional Profile Fields**: `age`, `province`, `education`, `skills`, `interests`, `avatar`.
    *   **Verification/Reset Tokens**: `emailToken`, `emailTokenExpires`, `resetToken`, `resetTokenExpires`, `deleteToken`, `deleteTokenExpires` (all `select: false` to prevent accidental exposure).
    *   **Privacy**: Passwords are never stored in plain text. Email and reset tokens are temporary and single-use.

*   **`CvProfile` Documents (`empowerai-backend/src/models/cvProfile.js`)**:
    *   Stores the AI analysis results of a user's uploaded CV, along with file metadata.
    *   **`rawText`**: The extracted text content of the CV.
        *   **Default Behavior**: By default, `rawText` is **NOT stored** (it's saved as an empty string). This is controlled by the `CV_STORE_RAW_TEXT` environment variable.
        *   **Capped Storage**: If `CV_STORE_RAW_TEXT` is enabled, the `rawText` field is capped at `10000` characters to prevent excessive document size.
    *   **`expiresAt`**: An optional TTL (Time-To-Live) index. If set (controlled by `CV_PROFILE_TTL_DAYS` env var), MongoDB will automatically delete the `CvProfile` document after this timestamp.
    *   **File Metadata**: `filename`, `mimetype`, `fileSize`.
    *   **AI Analysis**: `analysis` object containing `score`, `readinessLevel`, `summary`, `extractedSkills`, `missingSkills`, `marketKeywords`, `strengths`, `weaknesses`, `suggestions`, `recommendations`, `education`, `experience`, `links`.
    *   **Privacy**: The `CvProfile` is intentionally separate from the `User` identity-only document.

### 2. Browser Storage (Frontend)

The frontend application uses browser storage for temporary or non-sensitive data.

*   **`localStorage`**:
    *   Stores non-sensitive, derived items like `empowerai-token` (JWT), `twinData` (summary of digital twin), `twinCreated`, `cvCompleted`, `twinCompleted`, `empowermentScore`.
    *   **Important**: `localStorage` is **NOT** used for storing raw CV content or comprehensive CV analysis results.

*   **`sessionStorage`**:
    *   **Sensitive**: Full CV analysis results (`comprehensiveCVAnalysis`) are stored here.
    *   **Privacy**: `sessionStorage` is cleared when the browser tab is closed, providing a shorter retention period than `localStorage`. Access and cleanup are centralized via `frontend/src/lib/sensitiveStorage.ts`.

---

## Handling of Uploaded CV Files

*   **Uploaded CV Files**: When a user uploads a CV file (PDF, DOCX, TXT) to the `empowerai-backend`, the file is processed **in-memory** using `multer.memoryStorage()`. It is **NEVER written to disk** on the backend server.

---

## Raw CV Text Storage Policy

*   **Default Behavior**: Raw CV text extracted during analysis is **NOT stored** in the `CvProfile.rawText` field by default. The `rawText` field will contain an empty string. This is controlled by setting `CV_STORE_RAW_TEXT=false` in the backend's environment configuration.
*   **Optional Storage**: If `CV_STORE_RAW_TEXT=true` is explicitly set, the raw text will be stored, but it is capped at `10000` characters.

---

## Backend CV Retention Controls

*   **`CV_STORE_RAW_TEXT`**: Environment variable in `empowerai-backend` to control whether the `rawText` field in `CvProfile` documents is populated. Default is `false`.
*   **`CV_PROFILE_TTL_DAYS`**: Environment variable in `empowerai-backend` to set a Time-To-Live (TTL) for `CvProfile` documents. If set to a positive integer, MongoDB will automatically delete `CvProfile` documents after the specified number of days from their creation. This populates the `CvProfile.expiresAt` field.
*   **User Endpoints**:
    *   `GET /api/cv/profile`: Allows users to retrieve their stored CV analysis profile. The `rawText` field is excluded from the response by default.
    *   `DELETE /api/cv/profile`: Allows users to explicitly delete their `CvProfile` document from the database.

---

## AI Service Logging Hardening

*   **Reduced Verbosity**: Debug `print()` statements in AI service routes (e.g., `ai-service/routes/cv_analysis_file.py`, `ai-service/routes/cv_revamp.py`) have been removed to reduce noisy logging in production environments. Error logging using the `logger` utility remains.
*   **Sensitive Info**: Removed printing of AI provider endpoint/model at startup to prevent potential exposure of configuration details.

---

## Frontend Storage Hardening

*   **`sensitiveStorage.ts`**: Centralized module for handling sensitive client-side data.
*   **CV Analysis Data**: Full `comprehensiveCVAnalysis` data is now stored in `sessionStorage` instead of `localStorage`. This ensures the data is ephemeral and cleared upon tab closure.
*   **Dashboard/Stats**: Frontend components (e.g., Dashboard, stats APIs) no longer directly depend on `localStorage` for CV-related blobs (`cvAnalysisData`, `cvSkills`, `cvFileName`), instead relying on `sensitiveStorage` for access and cleanup.