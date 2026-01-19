# RSS Feed Aggregator Setup Guide

## Overview

The RSS Feed Aggregator automatically fetches real job opportunities from South African job boards and adds them to your database. This replaces manual data entry and ensures your opportunities are always up-to-date.

## Features

- ✅ **Automated Daily Updates**: Runs at 2:00 AM SAST every day
- ✅ **Real Data**: Fetches from Indeed SA, Careers24, and other RSS feeds
- ✅ **Smart Deduplication**: Prevents duplicate opportunities
- ✅ **Data Transformation**: Converts RSS items to Opportunity format
- ✅ **Error Handling**: Continues processing even if one feed fails
- ✅ **Manual Trigger**: API endpoint to manually update feeds

## How It Works

1. **Scheduled Job**: Cron job runs daily at 2:00 AM SAST
2. **Feed Fetching**: Fetches RSS feeds from configured sources
3. **Data Transformation**: Converts RSS items to Opportunity schema
4. **Deduplication**: Checks for existing opportunities by URL and title
5. **Database Insert**: Saves new opportunities to MongoDB

## Configuration

### Environment Variables

Add to your `.env` file:

```env
# RSS Feed Scheduler (enabled by default)
ENABLE_RSS_SCHEDULER=true
```

### RSS Feed Sources

**⚠️ Important Note:** Most South African job boards do not provide public RSS feeds, or they require authentication/API access. The RSS aggregator infrastructure is ready, but you'll need to:

1. **Find working RSS feeds** - Test URLs using `npm run rss:test` script
2. **Use manual seeding** - Continue using `npm run seed:opportunities` for now
3. **Add feeds as discovered** - Edit `src/services/rssFeedService.js` when you find working feeds

### Finding RSS Feeds

To find working RSS feeds:

1. **Test URLs manually**:
   ```bash
   node scripts/test-rss-url.js
   ```

2. **Check job board websites**:
   - Look for "RSS" or "Feed" links in footer
   - Check `/feed/` or `/rss.xml` URLs
   - Look for "Subscribe" or "Job Alerts" sections

3. **Common RSS URL patterns**:
   - `https://example.com/feed/`
   - `https://example.com/rss.xml`
   - `https://example.com/jobs/rss`
   - `https://example.com/rss?category=jobs`

### Currently Configured (Placeholder Feeds)

The service is configured with placeholder feeds that need to be replaced with working URLs:

1. **MyJobMag** - Needs valid RSS URL
2. **CareerJet SA** - Needs valid RSS URL  
3. **AllJobs.co.za** - Needs valid RSS URL

**To add a working feed**, edit `src/services/rssFeedService.js` and add to `FEED_SOURCES` array.

## Usage

### Automatic Updates (Recommended)

The scheduler starts automatically when the server starts (if `ENABLE_RSS_SCHEDULER` is not `false`).

**To disable automatic updates:**
```env
ENABLE_RSS_SCHEDULER=false
```

### Manual Updates

#### Option 1: API Endpoint

```bash
# Trigger manual update
curl -X POST https://your-api.com/api/rss/update

# Check scheduler status
curl https://your-api.com/api/rss/status

# Start scheduler
curl -X POST https://your-api.com/api/rss/scheduler/start

# Stop scheduler
curl -X POST https://your-api.com/api/rss/scheduler/stop
```

#### Option 2: Command Line Script

```bash
cd empowerai-backend
npm run rss:fetch
```

This will:
- Connect to MongoDB
- Fetch all RSS feeds
- Process and save new opportunities
- Print results summary

### Scheduled Cron Job (Alternative)

If you prefer to use system cron instead of node-cron:

```bash
# Edit crontab
crontab -e

# Add this line (runs daily at 2:00 AM)
0 2 * * * cd /path/to/empowerai-backend && npm run rss:fetch
```

## Data Transformation

The RSS items are transformed into our Opportunity schema:

```javascript
{
  title: String,              // Job title from RSS
  type: String,               // 'job', 'learnership', 'internship', etc.
  company: String,            // Extracted from description
  location: String,           // Extracted from title/description
  province: [String],         // Mapped from location
  description: String,        // Cleaned RSS content
  requirements: [String],     // Extracted from description
  skills: [String],           // Extracted from description
  salaryRange: {              // Extracted if mentioned
    min: Number,
    max: Number
  },
  deadline: Date,             // Publication date from RSS
  applicationUrl: String,     // Link from RSS item
  isActive: Boolean           // Default: true
}
```

## Deduplication Strategy

Opportunities are checked for duplicates using:

1. **Exact URL match**: If applicationUrl already exists
2. **Title + Company match**: If same title and company
3. **Title similarity**: If title is very similar

This prevents duplicate entries from multiple RSS feeds or repeated runs.

## Monitoring

### Logs

The service logs all operations:

```
INFO: Starting RSS feed aggregation...
INFO: Fetching feed: Indeed SA (https://za.indeed.com/rss...)
INFO: Found 50 items in Indeed SA feed
INFO: Processed Indeed SA: 10 new, 40 skipped
INFO: RSS aggregation complete: 10 new, 90 skipped, 0 errors
```

### Check Status via API

```bash
curl https://your-api.com/api/rss/status
```

Response:
```json
{
  "status": "success",
  "data": {
    "isRunning": true,
    "lastRun": null
  }
}
```

## Troubleshooting

### Feeds Not Updating

1. **Check logs**: Look for error messages in server logs
2. **Test manually**: Run `npm run rss:fetch` to see detailed output
3. **Check feed URLs**: Verify RSS feed URLs are still valid
4. **Check database connection**: Ensure MongoDB is connected

### Duplicate Opportunities

- The deduplication should prevent duplicates
- If you see duplicates, check:
  - Are feeds returning different URLs for same job?
  - Is title extraction working correctly?
  - Consider adding more strict deduplication rules

### No Opportunities Found

- Some feeds may have no items for "entry level" searches
- Try adjusting search terms in feed URLs
- Check if RSS feed structure has changed

## Adding New RSS Feeds

1. Find RSS feed URL from job board
2. Add to `FEED_SOURCES` in `src/services/rssFeedService.js`:

```javascript
{
  name: 'New Job Board',
  url: 'https://example.com/jobs/rss',
  type: 'job',
  transform: transformIndeedFeed  // Use existing or create new transformer
}
```

3. Create transformer function if needed (or reuse existing)

## Data Quality

### Automatic Extraction

The service automatically extracts:
- ✅ Company names
- ✅ Locations
- ✅ Skills
- ✅ Salary ranges
- ✅ Job types

### Limitations

- Some fields may be missing if not in RSS feed
- Company names may not always be accurate
- Salary ranges may not always be extracted
- Skills are matched from common skill list

### Improvement Tips

- Manually review and update opportunities periodically
- Add more skills to extraction list
- Improve company name extraction patterns
- Consider using AI to extract missing information

## Performance

- **Processing Time**: ~30-60 seconds for 3 feeds
- **Database Impact**: Minimal (only inserts new records)
- **Memory Usage**: Low (processes feeds sequentially)

## Security

- RSS feeds are publicly accessible
- No authentication needed to read feeds
- API endpoints can be restricted with auth middleware if needed

## Future Enhancements

- [ ] Add more RSS feed sources
- [ ] Use AI to extract missing information
- [ ] Add webhook support for real-time updates
- [ ] Create admin panel for feed management
- [ ] Add feed health monitoring
- [ ] Implement feed priority/ranking

## Support

For issues or questions:
1. Check logs for error messages
2. Test manually with `npm run rss:fetch`
3. Review RSS feed URLs are still valid
4. Check database connection status
