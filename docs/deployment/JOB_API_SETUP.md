# Job API Setup Guide

To get **real, live job data** from platforms like Adzuna and Indeed, you need to configure API keys.

## Available APIs

### 1. Adzuna API (Recommended - Free Tier Available)

**Why Adzuna:**
- ✅ Free tier available (1000 requests/month)
- ✅ Covers South African job market
- ✅ Real-time job listings
- ✅ No approval process needed

**Setup Steps:**

1. **Get API Credentials:**
   - Go to https://developer.adzuna.com/
   - Sign up for a free account
   - Create a new application
   - Copy your `Application ID` and `Application Key`

2. **Add to Render Environment Variables:**
   ```
   ADZUNA_APP_ID=your_app_id_here
   ADZUNA_APP_KEY=your_app_key_here
   ```

3. **Test the API:**
   ```bash
   curl "https://api.adzuna.com/v1/api/jobs/za/search/1?app_id=YOUR_APP_ID&app_key=YOUR_APP_KEY&what=entry%20level&results_per_page=5"
   ```

### 2. Indeed API (Optional)

**Why Indeed:**
- ✅ Large job database
- ✅ Covers South Africa
- ⚠️ Requires publisher account approval

**Setup Steps:**

1. **Get Publisher ID:**
   - Go to https://ads.indeed.com/jobroll/xmlfeed
   - Sign up for Indeed Publisher account
   - Get your Publisher ID

2. **Add to Render Environment Variables:**
   ```
   INDEED_PUBLISHER_ID=your_publisher_id_here
   ```

## How It Works

Once configured, the system will:

1. **Automatically fetch jobs** from configured APIs
2. **Deduplicate** based on external IDs and job details
3. **Transform** to our Opportunity format
4. **Save** to database with source tracking

## Manual Trigger

After setting up API keys, trigger a fetch:

```bash
curl -X POST https://empowerai.onrender.com/api/rss/update
```

This will fetch from:
- RSS feeds (if configured)
- Adzuna API (if credentials set)
- Indeed API (if credentials set)

## Rate Limits

- **Adzuna Free Tier:** 1000 requests/month
- **Indeed:** Varies by account type

The system respects rate limits and fetches efficiently.

## Monitoring

Check how many jobs were fetched:

```bash
curl https://empowerai.onrender.com/api/admin/stats
```

## Troubleshooting

**No jobs appearing:**
1. Check API credentials are set correctly in Render
2. Verify API keys are valid (test with curl)
3. Check backend logs for API errors
4. Ensure API accounts are active

**API errors:**
- Check rate limits haven't been exceeded
- Verify API keys haven't expired
- Check network connectivity from Render

## Next Steps

1. **Get Adzuna API keys** (easiest to start)
2. **Add to Render environment variables**
3. **Redeploy backend**
4. **Trigger manual update**
5. **Verify jobs appear in Opportunities page**

---

**Note:** For production, consider upgrading to paid tiers for higher rate limits and better data quality.
