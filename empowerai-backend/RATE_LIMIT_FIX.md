# Rate Limit Fix - CRITICAL

## Problem
CV routes are being rate-limited TWICE:
1. General `apiLimiter` (100 requests per 15 minutes) - applied to ALL `/api` routes
2. `aiServiceLimiter` (60 requests per minute) - applied specifically to CV routes

This causes immediate rate limiting even with just a few requests.

## Solution

In `empowerai-backend/src/server.js`, replace:

```javascript
// Apply rate limiting to all API routes
app.use('/api', apiLimiter);
```

With:

```javascript
// Apply rate limiting to all API routes EXCEPT CV and Auth routes (they have their own limiters)
// CV routes use aiServiceLimiter, Auth routes use authLimiter
app.use('/api', (req, res, next) => {
  // Skip general rate limiting for routes that have their own specific limiters
  if (req.path.startsWith('/cv') || req.path.startsWith('/auth')) {
    return next();
  }
  return apiLimiter(req, res, next);
});
```

## Additional Changes Made

1. Increased `aiServiceLimiter` from 60 to 200 requests per minute
2. Changed `skipSuccessfulRequests` to `true` - only count failed requests
3. Fixed retry logic to NOT retry on 429 errors

## Status
These changes need to be manually applied if automated replacement fails.
