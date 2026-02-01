# Render Free Tier Limitations

## Overview
Render's free tier has several limitations that can affect the EmpowerAI application:

## Known Issues

### 1. Service Sleep Mode
- **Issue**: Free tier services sleep after 15 minutes of inactivity
- **Impact**: First request after sleep can take 30-60 seconds (cold start)
- **Solution**: 
  - Services automatically wake up on first request
  - Consider using a paid plan for production
  - Or use a keep-alive service (external cron job) to ping health endpoint every 10 minutes

### 2. Cold Start Delays
- **Issue**: When a service wakes up, it can take 30-60 seconds to respond
- **Impact**: Timeout errors, rate limit confusion
- **Solution**: 
  - Increased timeout to 90 seconds in production
  - Added better error messages for Render cold starts
  - Frontend shows helpful message to users

### 3. Rate Limiting
- **Issue**: Render may have its own rate limiting at the platform level
- **Impact**: 429 errors even when our code allows requests
- **Solution**:
  - Increased our rate limits (60 requests/minute)
  - Excluded CV routes from general API limiter
  - Disabled retries on 429 errors

### 4. Shared Resources
- **Issue**: Free tier shares resources with other services
- **Impact**: Slower performance, potential throttling
- **Solution**: Monitor performance and upgrade if needed

## Configuration

### Backend (Node.js)
- Timeout increased to 90 seconds in production
- Better error handling for Render cold starts
- Health check endpoint at `/api/health`

### AI Service (Python/FastAPI)
- Health endpoint at `/health`
- Configured for Render deployment
- Timeout handling for cold starts

## Recommendations

1. **For Production**: Upgrade to Render paid plan ($7/month) to avoid sleep mode
2. **Keep-Alive**: Use external service (e.g., UptimeRobot) to ping health endpoint every 10 minutes
3. **Monitoring**: Monitor Render logs for cold start patterns
4. **User Communication**: Show helpful messages when services are waking up

## Keep-Alive Setup (Optional)

Use a free service like UptimeRobot to ping your health endpoints:
- Backend: `https://empowerai.onrender.com/api/health`
- AI Service: `https://your-ai-service.onrender.com/health`

Set monitoring interval to 10 minutes to prevent sleep.
