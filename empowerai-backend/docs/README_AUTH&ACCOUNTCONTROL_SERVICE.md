
# 🔐 Authentication & Account Management Service

## Overview

This module handles **user authentication and account lifecycle management** in EmpowerAI.

It covers everything from **registration → verification → login → password management → email changes → account deletion**, while staying compliant with **POPIA (South African data protection law)**.

The system is built with:

* Secure token-based workflows
* Email-driven verification flows
* Separation between **Pending Users** and **Verified Users**
* Strong error handling and logging

---

## 🧠 Architecture Summary

There are two main services:

### 1. Authentication Service

Handles:

* Registration
* Login
* Token generation

### 2. User Account Service

Handles:

* Email verification
* Password reset/change
* Email change
* Account deletion
* Data cleanup

---

## 📦 Core Models

| Model          | Purpose                                     |
| -------------- | ------------------------------------------- |
| `User`         | Fully registered and verified users         |
| `PendingUser`  | Temporary users awaiting email verification |
| `CvProfile`    | Stored CV analysis data                     |
| `EconomicTwin` | AI-generated user model                     |

---

## 🔑 Authentication Service

### `register(rawData, correlationId, clientIp)`

Registers a new user **as a pending account**.

#### What it does:

* Validates input via DTO
* Enforces **POPIA consent requirements**
* Checks for duplicate emails
* Assigns role (`admin` or `user`)
* Generates secure email verification token
* Stores user in `PendingUser`
* Sends verification email

#### Key Rules:

* User **must accept consent checkboxes**
* Email must be unique across both collections
* Token expires in **1 hour**

#### Output:

```json
{
  "id": "pending_user_id",
  "email": "user@example.com"
}
```

---

### `login(rawData, correlationId)`

Authenticates a verified user.

#### What it does:

* Validates credentials
* Checks if user exists
* Ensures email is verified
* Compares password securely
* Updates last activity timestamp
* Generates JWT token

#### Output:

```json
{
  "token": "jwt_token",
  "user": {
    "id": "...",
    "email": "...",
    "name": "...",
    "role": "user"
  }
}
```

---

## 👤 User Account Service

---

### `verifyEmail(rawToken)`

Completes user registration.

#### What it does:

* Hashes incoming token
* Finds matching `PendingUser`
* Prevents duplicate verification
* Promotes user to `User`
* Transfers consent data (POPIA compliance)
* Deletes pending record

---

### `forgotPassword(rawData)`

Initiates password reset.

#### What it does:

* Generates reset token
* Stores hashed token + expiry (30 mins)
* Sends reset email

#### Note:

* Silent fail if email does not exist (security best practice)

---

### `resetPassword(rawData)`

Completes password reset.

#### What it does:

* Validates token
* Updates password
* Clears reset token

---

### `changePassword(userId, rawData)`

Allows logged-in users to change password.

#### What it does:

* Verifies current password
* Updates to new password securely

---

### `requestEmailChange(userId, rawData)`

Starts email change process.

#### What it does:

* Stores new email temporarily (`pendingEmail`)
* Generates verification token
* Sends confirmation email to new address

---

### `confirmEmailChange(rawToken)`

Finalizes email change.

#### What it does:

* Verifies token
* Updates email
* Clears temporary fields

---

### `requestAccountDeletion(userId)`

Initiates account deletion.

#### What it does:

* Generates deletion token
* Sends confirmation email
* Token expires in **15 minutes**

---

### `confirmAccountDeletion(rawToken)`

Deletes user and all related data.

#### What it does:

* Validates token
* Deletes:

  * User account
  * CV data
  * Economic Twin
* Logs deletion (POPIA compliance)

---

## 🔐 Security Features

* Password hashing (via model hooks)
* Token hashing using `SHA-256`
* JWT authentication
* Email-based verification flows
* Expiring tokens:

  * Verification: **1 hour**
  * Reset: **30 minutes**
  * Deletion: **15 minutes**

---

## ⚖️ POPIA Compliance

The system enforces:

* Explicit user consent:

  * Data processing
  * Profile sharing
  * AI processing
* Consent metadata stored:

  * Timestamp
  * IP address
* Full data deletion on request

---

## 📧 Email Integration

All critical actions are verified via email:

| Action           | Email Trigger         |
| ---------------- | --------------------- |
| Registration     | Verification email    |
| Password reset   | Reset link            |
| Email change     | Confirmation link     |
| Account deletion | Deletion confirmation |

Handled via centralized:

```
emailService
```

---

## ⚠️ Error Handling

Custom errors used:

* `ConflictError`
* `UnauthorizedError`
* `NotFoundError`

Behavior:

* Prevents sensitive info leaks
* Returns safe, user-friendly messages

---

## 🔄 Full User Lifecycle

```text
Register
  ↓
PendingUser created
  ↓
Email verification
  ↓
User activated
  ↓
Login (JWT issued)
  ↓
Profile usage
  ↓
Optional actions:
  → Change password
  → Reset password
  → Change email
  → Delete account
```

---

## 🚀 Design Strengths

* Clean separation of concerns
* Scalable service structure
* Email-driven security model
* Fully compliant with real-world regulations (POPIA)
* Safe against common auth vulnerabilities

---

## 🔮 Future Improvements

* Add refresh tokens
* Add MFA (2FA)
* Add login attempt throttling
* Add audit logs for all security events
* Integrate OAuth (Google, Microsoft)

