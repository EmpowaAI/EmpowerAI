

# Email Service Setup Guide

## Overview

The Email Service handles all user email communications in EmpowerAI, including:

* ✅ **User Verification**: Sends verification emails during registration
* ✅ **Password Recovery**: Handles forgot password and reset password flows
* ✅ **Secure SMTP Integration**: Uses Gmail with app passwords
* ✅ **Reusable Service Functions**: Centralized email sending logic

This ensures all email-related workflows are consistent and easy to maintain.

---

## Features

* ✅ **Account Verification Emails**: Sends unique token links to verify accounts
* ✅ **Forgot Password Emails**: Sends password reset links with secure tokens
* ✅ **Customizable Email Templates**: HTML content with dynamic links
* ✅ **Environment Configurable**: Uses `.env` for host, port, and credentials
* ✅ **Non-blocking Service**: Errors in sending emails do not crash the server

---

## How It Works

### User Registration Flow

1. **Register user** → `POST /api/auth/register`
2. **EmailService** generates a unique verification token and sends email
3. **User clicks verification link** → `GET /api/account/verify?token=<token>`
4. **Account is verified** → user can log in

### Forgot Password Flow

1. User requests password reset → `POST /api/account/forgot`
2. **EmailService** sends reset token link
3. User submits new password → `POST /api/account/reset`
4. Password is updated in the database

---

## Configuration

### Environment Variables

Add the following to your `.env` file:

```env
# Email SMTP configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_gmail_address@gmail.com
EMAIL_PASS=your_gmail_app_password

# Frontend URL for verification/reset links
FRONTEND_URL=https://yourapp.com
```

> ⚠️ Never commit your `.env` with real credentials.

---

### Gmail Setup Steps

1. **Enable 2-Step Verification** on your Gmail account.
2. Go to **Google Account → Security → App Passwords**.
3. Create a new app password for **Mail → Other (Custom Name)**.
4. Copy the 16-character password and use it as `EMAIL_PASS` in `.env`.
5. Ensure `EMAIL_USER` matches the Gmail account used to generate the app password.
6. Test sending emails using registration or forgot password flows.

---

## Files Added

| File                   | Location                               | Purpose                                                                                                                    |
| ---------------------- | -------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `accountController.js` | `src/controllers/accountController.js` | Handles logic for `/verify`, `/forgot`, `/reset` routes. Calls `emailService` functions.                                   |
| `emailService.js`      | `src/services/emailService.js`         | Centralized email sending functions (`sendVerificationEmail`, `sendPasswordResetEmail`). Uses SMTP with Gmail credentials. |
| `routes/account.js`    | `src/routes/account.js`                | Defines public routes for email verification and password recovery.                                                        |
| `.env`                 | Project root                           | Stores email credentials and frontend URL for links.                                                                       |

---

## Usage

### Sending Verification Email

Triggered automatically on user registration:

```javascript
await emailService.sendVerificationEmail(user.email, token);
```

Verification link example:

```
GET https://yourapp.com/api/account/verify?token=<token>
```

### Sending Password Reset Email

Triggered via forgot password route:

```javascript
await emailService.sendPasswordResetEmail(user.email, token);
```

Reset link example:

```
POST https://yourapp.com/api/account/reset
Body: { token: "<token>", newPassword: "12345678" }
```

---

## Example Email Flow

**Registration / Verification Flow:**

```text
User registers
     ↓
EmailService sends verification email with token
     ↓
User clicks verification link
     ↓
Account verified → User can login
```

**Forgot / Reset Password Flow:**

```text
User requests password reset
     ↓
EmailService sends reset link
     ↓
User submits new password with token
     ↓
Password updated
```

---

## Monitoring & Debugging

* Check server logs for email sending errors
* Ensure SMTP credentials are correct in `.env`
* Test email flows using registration and forgot password endpoints

---

## Notes

* `FRONTEND_URL` must point to your frontend to build verification/reset links correctly.
* Errors in email sending do not block server startup.
* Email templates are HTML for better user experience.

---

## Future Enhancements

* [ ] Add custom HTML templates per email type
* [ ] Track email delivery status
* [ ] Add support for multiple email providers
* [ ] Integrate with transactional email services (SendGrid, Postmark)


