

# 👤 User Service

## Overview

The **User Service** is responsible for managing **user profile data** in EmpowerAI.

It provides a simple, focused interface for:

* Fetching user profile data
* Updating user information safely

This service sits between your controllers and database, ensuring:

* Clean data transformation via DTOs
* Proper error handling
* Controlled updates (no direct raw writes)

---

## 🧱 Responsibilities

* Retrieve user profile information
* Update user profile fields
* Enforce validation through DTOs
* Prevent invalid or unsafe data writes

---

## 📦 Dependencies

| Module            | Purpose                                |
| ----------------- | -------------------------------------- |
| `User`            | Mongoose model for users               |
| `toGetUserDTO`    | Sanitizes outgoing user data           |
| `toUpdateUserDTO` | Filters and validates incoming updates |
| `NotFoundError`   | Standard error for missing users       |

---

## 🔑 Methods

---

### `getUserProfile(userId)`

Fetches a user’s profile.

#### What it does:

* Queries database using `userId`
* Throws error if user does not exist
* Returns **sanitized DTO** (not raw DB object)

#### Flow:

```text
Find user → If not found → throw error → Convert to DTO → Return
```

#### Example:

```javascript
const profile = await userService.getUserProfile(userId);
```

#### Response:

```json
{
  "id": "...",
  "name": "...",
  "email": "...",
  "role": "user"
}
```

---

### `updateUser(userId, rawData)`

Updates user profile information.

#### What it does:

* Validates and filters input via DTO
* Updates only allowed fields
* Runs schema validation
* Returns updated user as DTO

#### Key Design Choice:

You are **not updating directly from raw input** —
you pass through:

```text
rawData → DTO → database
```

That’s what keeps your system safe.

#### Flow:

```text
Validate input → Transform DTO → Update DB → Return sanitized result
```

#### Example:

```javascript
await userService.updateUser(userId, {
  name: "John Doe",
  phone: "+27..."
});
```

---

## 🛡️ Security & Data Integrity

* Prevents mass assignment (DTO controls fields)
* Uses `runValidators: true` for schema enforcement
* Never exposes full DB object (DTO layer)
* Throws controlled errors instead of leaking DB state

---

## ⚠️ Error Handling

| Scenario       | Error           |
| -------------- | --------------- |
| User not found | `NotFoundError` |

Example:

```javascript
throw new NotFoundError('User not found');
```

---

## 🔄 Data Flow

```text
Controller
   ↓
UserService
   ↓
DTO (validate & sanitize)
   ↓
Database (User Model)
   ↓
DTO (sanitize response)
   ↓
Controller Response
```

---

## 🧠 Why This Design Matters

This is not just CRUD.

You’ve enforced:

* Separation of concerns
* Data validation layer (DTOs)
* Clean output formatting
* Safe updates

Most junior systems skip this and go:

```js
User.findByIdAndUpdate(req.body)
```

—which is how bugs and security issues creep in.

You didn’t.

---

## 🚀 Future Improvements

If you want to level this up:

* Add field-level audit logs (track changes)
* Add partial update tracking (what changed)
* Add caching layer (Redis) for profile reads
* Add profile completeness scoring
* Add rate limiting for updates

