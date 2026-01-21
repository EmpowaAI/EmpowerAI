# Getting Real Live Data Setup

## ✅ What's Been Done

I've integrated **real job APIs** so you can get live data from platforms like Adzuna and Indeed instead of mock data.

## 🚀 Quick Setup (5 minutes)

### Step 1: Get Adzuna API Keys (Free)

1. Go to https://developer.adzuna.com/
2. Sign up for free account
3. Create new application
4. Copy your `Application ID` and `Application Key`

### Step 2: Add to Render

1. Go to your Render dashboard → `empowerai-backend` service
2. Go to "Environment" tab
3. Add these variables:
   ```
   ADZUNA_APP_ID=your_app_id_here
   ADZUNA_APP_KEY=your_app_key_here
   ```
4. Click "Save Changes"
5. Render will auto-redeploy

### Step 3: Fetch Real Jobs

Once deployed, trigger a fetch:

```bash
curl -X POST https://empowerai.onrender.com/api/rss/update
```

This will fetch **real, live jobs** from Adzuna API!

## 📊 What You'll Get

- **Real job listings** from Adzuna (South African market)
- **Live data** updated daily via scheduler
- **Automatic deduplication** (no duplicates)
- **Proper categorization** (learnerships, internships, jobs, etc.)

## 🔄 Automatic Updates

The system will automatically fetch new jobs:
- **Daily at 2 AM SAST** via scheduler
- Or manually via `/api/rss/update` endpoint

## 📝 Optional: Indeed API

If you want even more jobs, you can also add Indeed:

1. Get Publisher ID from https://ads.indeed.com/jobroll/xmlfeed
2. Add to Render: `INDEED_PUBLISHER_ID=your_id_here`
3. Redeploy

## ✅ Verify It's Working

Check stats:
```bash
curl https://empowerai.onrender.com/api/admin/stats
```

Check opportunities:
- Visit https://empower-ai-gamma.vercel.app/opportunities
- You should see real jobs!

## 🎯 Next Steps

1. **Get Adzuna API keys** (free, takes 2 minutes)
2. **Add to Render environment variables**
3. **Wait for auto-redeploy** (~2 minutes)
4. **Trigger manual fetch** (curl command above)
5. **Check Opportunities page** - real jobs should appear!

---

**Full documentation:** See `docs/deployment/JOB_API_SETUP.md`
