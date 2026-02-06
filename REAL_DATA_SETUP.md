# 🎯 Real Data Integration - Complete Setup Guide

## What Changed

You now have a **REAL application with actual opportunities**, not a demo. The system is designed to fetch from real job boards and match opportunities to user profiles.

---

## ✅ What's Implemented

### 1. **Real Job Data Sources**
- ✅ **Adzuna API** - South African jobs, learnerships, internships
- ✅ **Indeed API** - Global + South African opportunities
- ✅ **RSS Feeds** - Job board aggregators
- ✅ **Deduplication** - Prevents duplicate opportunities

### 2. **Smart Matching System**
Opportunities are now matched to user profiles based on:
- Skills (40% weight)
- Location/Province (25% weight)
- Experience Level (20% weight)
- Salary Range (10% weight)
- Job Type Preferences (5% weight)

Each opportunity gets a **match score (0-100)** and **match reason**.

### 3. **Automated Updates**
- Scheduler fetches new opportunities every 2 hours
- Runs on server startup
- Configurable interval
- Non-blocking (continues if API fails)

### 4. **Real-Time Data**
- Live opportunities from actual job boards
- Real company names and positions
- Real salary ranges
- Real application URLs
- Fresh data every 2 hours

---

## 🚀 Quick Start - Enable Real Data

### Step 1: Get Adzuna API Credentials (5 minutes)

1. Visit: https://developer.adzuna.com
2. Sign up for free account
3. Create an application
4. Copy your `App ID` and `App Key`

### Step 2: Add to Environment

**Local Development (.env)**
```env
ADZUNA_APP_ID=your_app_id_here
ADZUNA_APP_KEY=your_app_key_here
ENABLE_JOB_API_SCHEDULER=true
```

**Production (Render Dashboard)**
1. Go to: https://dashboard.render.com
2. Select your backend service
3. Click **Environment**
4. Add:
   - Key: `ADZUNA_APP_ID`, Value: `your_app_id`
   - Key: `ADZUNA_APP_KEY`, Value: `your_app_key`
   - Key: `ENABLE_JOB_API_SCHEDULER`, Value: `true`
5. Click **Save Changes** → **Redeploy**

### Step 3: Fetch Real Opportunities

```bash
cd empowerai-backend
node scripts/fetchRealOpportunities.js
```

This will:
- Fetch from Adzuna API
- Fetch from Indeed (if configured)
- Fetch from RSS feeds
- Save all to database
- Show statistics

### Step 4: Start Server

```bash
node src/server.js
```

The server will:
- ✅ Load existing opportunities from database
- ✅ Start Job API scheduler (fetches every 2 hours)
- ✅ Start RSS scheduler (if enabled)
- ✅ Apply smart matching to API requests

---

## 📊 API Examples

### Get All Opportunities (with auto-matching)
```bash
GET /api/opportunities
```

Response:
```json
{
  "status": "success",
  "results": 42,
  "meta": {
    "totalInDatabase": 850,
    "dataSource": "real opportunities from Adzuna, Indeed, and job boards",
    "lastUpdated": "2026-02-06T15:30:00.000Z"
  },
  "data": {
    "opportunities": [...]
  }
}
```

### Filter by Skills & Province
```bash
GET /api/opportunities?skills=JavaScript,React&province=Gauteng
```

Returns top opportunities matching these criteria, ranked by match score.

### Filter by Minimum Match Score
```bash
GET /api/opportunities?skills=Python&minScore=70
```

Only returns opportunities with 70+ match score.

---

## 🎯 Smart Matching Example

**User Profile:**
- Skills: JavaScript, React, Node.js
- Location: Gauteng
- Experience: 0 years (graduate)
- Salary Range: R10,000 - R20,000

**Opportunity 1:**
```json
{
  "title": "Junior Frontend Developer",
  "company": "Nedbank",
  "province": ["Gauteng"],
  "skills": ["React", "JavaScript", "CSS"],
  "description": "Entry-level position for junior developer...",
  "matchScore": 94,
  "matchReason": "3 of 3 skills match, location is Gauteng, perfect for graduate level"
}
```

**Opportunity 2:**
```json
{
  "title": "Senior Python Developer",
  "company": "Tech Corp",
  "province": ["Western Cape"],
  "skills": ["Python", "Django", "AWS"],
  "matchScore": 15,
  "matchReason": "0 of your skills match, different province, experience level doesn't fit"
}
```

---

## 📁 New Files & Services

| File | Purpose |
|------|---------|
| `scripts/fetchRealOpportunities.js` | Manual fetch script for testing |
| `src/services/jobAPIScheduler.js` | Automated fetching service |
| `src/services/jobAPIService.js` | ✅ Already existed, now used |
| `src/services/opportunityMatchingService.js` | Smart matching algorithm |
| `docs/REAL_DATA_INTEGRATION.md` | Complete integration guide |

---

## 🔧 Configuration Options

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `ADZUNA_APP_ID` | - | Your Adzuna app ID (required for Adzuna) |
| `ADZUNA_APP_KEY` | - | Your Adzuna app key (required for Adzuna) |
| `INDEED_PUBLISHER_ID` | - | Your Indeed publisher ID (optional) |
| `ENABLE_JOB_API_SCHEDULER` | true | Enable automated fetching |
| `JOB_API_FETCH_INTERVAL` | 120 | Minutes between fetches (default: 2 hours) |

---

## 📈 Expected Results

### Before
```
17 hardcoded mock opportunities
No personalization
Static data from Feb 2026
Limited to pre-defined set
```

### After
```
850-1000+ real opportunities from Adzuna, Indeed, RSS feeds
Personalized for each user (match scores 0-100)
Updates automatically every 2 hours
Unlimited real-time data from job boards
```

---

## ✨ Key Features

### 1. Real-Time Data
- Fetches live opportunities from actual job boards
- Updates every 2 hours automatically
- Always fresh, relevant jobs

### 2. Smart Matching
```javascript
Match Score = 
  (skills match * 40%) + 
  (location match * 25%) + 
  (experience match * 20%) + 
  (salary match * 10%) + 
  (type match * 5%)
```

### 3. Deduplication
- Prevents duplicate opportunities
- Tracks by external ID + source
- Fallback matching by title, company, location

### 4. Automatic Sync
- Runs every 2 hours
- Non-blocking (doesn't crash if API is down)
- Logs all activities

---

## 🧪 Testing

### Test Adzuna API Connection
```bash
cd empowerai-backend
node scripts/testAdzunaAPI.js
```

### Fetch Real Opportunities
```bash
node scripts/fetchRealOpportunities.js
```

### Check Database
```bash
cd empowerai-backend/..
node check-data.cjs
```

---

## 📚 Additional Resources

- **Adzuna API Docs**: https://developer.adzuna.com/docs
- **Indeed API Docs**: https://opensource.indeedeng.io/api-documentation/
- **Full Integration Guide**: [docs/REAL_DATA_INTEGRATION.md](../docs/REAL_DATA_INTEGRATION.md)

---

## 🎉 Next Steps

1. ✅ Get Adzuna API credentials
2. ✅ Add to environment variables
3. ✅ Run `fetchRealOpportunities.js` to load initial data
4. ✅ Start server - it will automatically update every 2 hours
5. ✅ Frontend will show real opportunities with match scores
6. ✅ Users see personalized opportunities based on their profile

---

## 🚨 Troubleshooting

### "No job APIs are configured"
- Get Adzuna credentials from https://developer.adzuna.com
- Add ADZUNA_APP_ID and ADZUNA_APP_KEY to .env

### "0 opportunities fetched"
- Check API credentials are correct
- Check network connection
- Check Adzuna API status
- Run `node scripts/testAdzunaAPI.js` to debug

### "Opportunities not updating"
- Check ENABLE_JOB_API_SCHEDULER=true in env
- Check logs for errors
- Check Adzuna API quota (free tier: 500/day)

---

## 💡 Pro Tips

- **For Development**: Run `node scripts/fetchRealOpportunities.js` manually to test
- **For Production**: Set `ENABLE_JOB_API_SCHEDULER=true` to auto-update
- **For Testing**: Use `minScore=70` parameter to test matching
- **For Analytics**: Check response `meta` field for data sources and last update time

---

🎯 **You now have a REAL application with actual opportunities, personalized matching, and automatic updates!**
