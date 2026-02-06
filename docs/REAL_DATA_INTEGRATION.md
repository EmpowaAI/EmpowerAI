# Real Data Integration Guide - EmpowerAI

## Current Status: ❌ Using Mock Data

The application is currently using **hardcoded seed data** instead of real opportunities. This document outlines how to transition to **100% real data** from actual job boards.

---

## Architecture Overview

### Current System (Mock)
```
Mock Seed Data → MongoDB → Frontend
```

### Real System (Target)
```
Real Job APIs (Adzuna, Indeed, PNet) → Real-Time Matching → MongoDB → Frontend
                ↓
            User Profile Analysis (Skills, Location, Interests)
                ↓
            Personalized Opportunity Ranking
```

---

## Real Data Sources Available

### 1. **Adzuna API** ⭐ RECOMMENDED
- **Coverage**: South African jobs, learnerships, internships
- **Cost**: Free tier available (500 requests/day)
- **Setup Time**: 5 minutes
- **Link**: https://developer.adzuna.com

**Steps:**
1. Sign up at https://developer.adzuna.com
2. Create an app to get `APP_ID` and `APP_KEY`
3. Add to environment variables:
   ```env
   ADZUNA_APP_ID=your_app_id
   ADZUNA_APP_KEY=your_app_key
   ```

### 2. **PNet API** (South African)
- **Coverage**: PNet job listings
- **Cost**: Paid (contact sales)
- **Link**: https://www.pnet.co.za/api

### 3. **Indeed API**
- **Coverage**: Global including South Africa
- **Cost**: Free tier available
- **Link**: https://opensource.indeedeng.io/api-documentation/

**Steps:**
1. Get Publisher ID from Indeed
2. Add to environment:
   ```env
   INDEED_PUBLISHER_ID=your_publisher_id
   ```

### 4. **RSS Feed Aggregators**
- **MyJobMag**: https://www.myjobmag.co.za/feeds
- **CareerJet SA**: https://www.careerjet.co.za
- **Local SETA Job Boards**: Government training opportunities

---

## Implementation Steps

### Phase 1: Enable Adzuna API (Week 1)

**File**: `empowerai-backend/src/services/jobAPIService.js` ✅ Already Implemented

```javascript
// Add to .env
ADZUNA_APP_ID=your_id
ADZUNA_APP_KEY=your_key
```

**Commands:**
```bash
# Fetch real opportunities from Adzuna
node scripts/fetchRealOpportunities.js

# Run on schedule (daily at 2 AM)
ENABLE_JOB_API_SCHEDULER=true
```

### Phase 2: Add Smart Matching (Week 2)

**Match opportunities based on:**
- ✅ User skills (extracted from CV)
- ✅ User location/province preference
- ✅ User experience level
- ✅ User interests/goals
- ✅ Salary expectations

**File to create**: `src/services/opportunityMatchingService.js`

```javascript
function matchUserToOpportunities(userProfile, opportunities) {
  // Score each opportunity (0-100)
  return opportunities.map(opp => ({
    ...opp,
    matchScore: calculateMatch(userProfile, opp)
  })).sort((a, b) => b.matchScore - a.matchScore);
}
```

### Phase 3: Real-Time Filtering (Week 3)

**Endpoint**: `GET /api/opportunities?skills=JavaScript&province=Gauteng&type=job`

Returns opportunities personalized to user's profile, sorted by match score.

### Phase 4: Remove Mock Data (Week 4)

Delete or archive `seedOpportunities.js` mock data.

---

## Current Implementation Status

| Feature | Status | File |
|---------|--------|------|
| Adzuna API Integration | ✅ Implemented | `jobAPIService.js` |
| Indeed API Integration | ✅ Implemented | `jobAPIService.js` |
| RSS Feed Aggregation | ✅ Implemented | `rssFeedService.js` |
| Smart Matching | ❌ Not Implemented | Need to create |
| Automated Daily Fetch | ⚠️ Partial | `rssScheduler.js` exists, need job API scheduler |
| Real-Time Personalization | ❌ Not Implemented | Need to create |

---

## API Responses

### Before (Mock Data)
```json
{
  "status": "success",
  "results": 17,
  "data": {
    "opportunities": [
      {
        "title": "Junior Frontend Developer",
        "company": "Nedbank",
        "applicationUrl": "https://nedbank.wd3.myworkdaysite.com/..."
      }
    ]
  }
}
```

### After (Real Data with Matching)
```json
{
  "status": "success",
  "results": 256,
  "data": {
    "opportunities": [
      {
        "title": "Junior Frontend Developer",
        "company": "Nedbank",
        "matchScore": 92,
        "matchReason": "Your React skills match 95%, location is Gauteng",
        "applicationUrl": "https://career.adzuna.com/...",
        "source": "adzuna",
        "fetchedAt": "2026-02-06T12:34:56Z"
      },
      {
        "title": "Web Developer Internship",
        "company": "TechCorp",
        "matchScore": 85,
        "matchReason": "Your skills match 80%, perfect for experience level"
      }
    ]
  }
}
```

---

## Environment Variables Setup

### Development (.env)
```env
# Job API Credentials
ADZUNA_APP_ID=your_adzuna_id
ADZUNA_APP_KEY=your_adzuna_key
INDEED_PUBLISHER_ID=your_indeed_id

# Scheduler
ENABLE_JOB_API_SCHEDULER=true
ENABLE_RSS_SCHEDULER=true
```

### Production (Render Dashboard)
1. Go to: https://dashboard.render.com
2. Select your backend service
3. Go to **Environment** tab
4. Add:
   - `ADZUNA_APP_ID`
   - `ADZUNA_APP_KEY`
   - `INDEED_PUBLISHER_ID`
   - `ENABLE_JOB_API_SCHEDULER=true`

---

## Testing Real Data

### 1. Test Adzuna API Directly
```bash
node scripts/testAdzunaAPI.js
```

### 2. Fetch and Load Real Opportunities
```bash
node scripts/fetchRealOpportunities.js
```

### 3. Check Database
```bash
node check-data.cjs
```

---

## User Profile Matching Algorithm

```javascript
matchScore = 
  (skillsMatch * 0.40) +        // 40% weight: relevant skills
  (locationMatch * 0.25) +       // 25% weight: location preference
  (experienceMatch * 0.20) +     // 20% weight: experience level
  (salaryMatch * 0.10) +         // 10% weight: salary range
  (typeMatch * 0.05)             // 5% weight: job type preference
```

### Example:
- User has React, JavaScript, 2 years experience, based in Cape Town
- Opportunity: React Developer in Cape Town, 1-3 years required
- **Match Score**: 94/100 ✅

---

## Real-Time Updates

### Schedule
- **Every 2 hours**: Fetch new opportunities from Adzuna & Indeed
- **Daily at 2 AM SAST**: Deep sync from all sources
- **On-demand**: User can refresh opportunities list

### Deduplication
Opportunities are deduplicated by:
1. External ID + Source (primary)
2. Title + Company + Location (fallback)
3. Application URL (tertiary)

---

## Migration Checklist

- [ ] Get Adzuna API credentials
- [ ] Configure ADZUNA_APP_ID and ADZUNA_APP_KEY in .env
- [ ] Test Adzuna API integration
- [ ] Create job API scheduler service
- [ ] Implement opportunity matching algorithm
- [ ] Add matching logic to /api/opportunities endpoint
- [ ] Test with real user profiles
- [ ] Deploy to Render (add env variables)
- [ ] Monitor data quality
- [ ] Remove mock seed data
- [ ] Update frontend with match scores

---

## Expected Results

### Before
- 17 hardcoded opportunities
- No personalization
- Deadlines from 2026 (static)
- No real company data

### After
- 1000+ opportunities from real job boards
- Personalized for each user
- Real-time updates every 2 hours
- Real companies, salaries, application URLs
- User-specific match scores
- Smart ranking by relevance

---

## Support

For Adzuna API questions: https://developer.adzuna.com/docs
For Indeed API questions: https://opensource.indeedeng.io/api-documentation/
