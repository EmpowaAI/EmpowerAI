
# Email Service Setup Guide (Production Version)

## Overview

The Email Service is a **centralized communication layer** responsible for handling all outbound email operations in EmpowerAI.

It goes beyond basic authentication emails and supports:

* ✅ **Authentication Emails** (verification, reset, email change, deletion)
* ✅ **User Lifecycle Emails** (welcome, upgrades)
* ✅ **Marketplace Emails** (job applications, confirmations)
* ✅ **System Notifications**
* ✅ **Feedback & Surveys**
* ✅ **Support Requests**
* ✅ **Secure API-based delivery (Brevo)**

All email logic is centralized into a single service for consistency, scalability, and maintainability.

---

## Features

* ✅ **Token-based authentication emails** (secure links)
* ✅ **Centralized reusable email service**
* ✅ **HTML + text fallback support**
* ✅ **Input sanitization (prevents injection)**
* ✅ **Retry logic for failed email delivery**
* ✅ **Environment-based configuration**
* ✅ **Structured logging for debugging**
* ✅ **Non-blocking architecture (safe failures)**

---

## Email Categories

### 🔐 Authentication

* Email verification
* Password reset
* Email change confirmation
* Account deletion confirmation

### 👤 User Lifecycle

* Welcome emails
* Subscription upgrades (free → premium)

### 💼 Marketplace

* Job application notifications (to employer)
* Application confirmation (to applicant)

### 📢 System Notifications

* General system alerts
* Custom notifications with optional CTA buttons

### 📝 Feedback & Surveys

* User feedback submission
* Survey responses (structured table format)

### 🆘 Support

* User support requests routed to admin

---

## How It Works

### Email Flow (General)

```text
Controller / Service
        ↓
EmailService method called
        ↓
Content sanitized + wrapped
        ↓
Brevo API request sent
        ↓
Retry if failed (2 attempts)
        ↓
Log result
```

---

## Configuration

### Environment Variables

```env
# Brevo API Configuration
BREVO_API_KEY=your_brevo_api_key

# Sender Info
EMAIL_FROM=no-reply@yourapp.com
EMAIL_NAME=EmpowaAI

# Frontend URL (used for token links)
FRONTEND_URL=https://yourapp.com

# Environment
NODE_ENV=production
```

> ⚠️ Never commit `.env` to version control.

---

## Email Provider (Brevo)

This service uses Brevo (formerly Sendinblue):

* Transactional email API
* High deliverability
* Built-in retry resilience
* No SMTP configuration required

---

## Core File

| File              | Location        | Purpose                                       |
| ----------------- | --------------- | --------------------------------------------- |
| `emailService.js` | `src/services/` | Handles all email sending logic and templates |

---

## Usage Examples

### 🔐 Send Verification Email

```javascript
await emailService.sendVerification(email, token);
```

---

### 🔑 Send Password Reset

```javascript
await emailService.sendReset(email, token);
```

---

### 🗑️ Send Account Deletion

```javascript
await emailService.sendAccountDeletion(email, token);
```

---

### 📧 Send Email Change Confirmation

```javascript
await emailService.sendEmailChange(email, token);
```

---

### 👋 Send Welcome Email

```javascript
await emailService.sendWelcome(email, name);
```

---

### 💎 Send Upgrade Notification

```javascript
await emailService.sendUpgrade(email, name, plan);
```

---

### 💼 Job Application (Employer)

```javascript
await emailService.sendJobApplication(employerEmail, applicantName, jobTitle);
```

---

### ✅ Application Confirmation (User)

```javascript
await emailService.sendApplicationConfirmation(userEmail, jobTitle);
```

---

### 📢 System Notification

```javascript
await emailService.sendNotification(email, subject, title, message);
```

---

### 📝 Feedback Submission

```javascript
await emailService.sendFeedback(userEmail, name, message);
```

---

### 📊 Survey Submission

```javascript
await emailService.sendSurvey(userEmail, name, responses);
```

---

### 🆘 Support Request

```javascript
await emailService.sendSupportRequest(userEmail, message);
```

---

## Example Flows

### 🔐 Registration Flow

```text
User registers
     ↓
sendVerification()
     ↓
User clicks link
     ↓
Account verified
```

---

### 🔑 Password Reset Flow

```text
User requests reset
     ↓
sendReset()
     ↓
User submits new password
     ↓
Password updated
```

---

### 💼 Job Application Flow

```text
User applies for job
     ↓
sendJobApplication() → employer
sendApplicationConfirmation() → user
```

---

## Security & Reliability

### 🔒 Security

* All user input is sanitized (prevents HTML/script injection)
* Tokens must be validated and expired on backend
* No sensitive data is exposed in emails

### 🔁 Reliability

* Retry mechanism (2 attempts)
* Logs failures without crashing server
* Text fallback for email clients

---

## Monitoring & Debugging

* Logs include:

  * timestamp
  * environment
  * error messages
* Check logs for:

  * failed API calls
  * missing environment variables

---

## Notes

* `FRONTEND_URL` is required for building action links
* Email failures do not crash the application
* HTML templates are inline for simplicity (can be externalized later)

---

## Future Enhancements

* [ ] Email queue system (BullMQ + Redis)
* [ ] Template engine (Handlebars / MJML)
* [ ] Email analytics (open/click tracking)
* [ ] Multi-provider fallback (Brevo + SendGrid)
* [ ] Rate limiting for abuse prevention

---

## 🚀 Final Reality Check

This is no longer:

> “send an email”

This is:

> **a system-level communication service**

You’ve built something that can power:

* SaaS platforms
* marketplaces
* real production apps


