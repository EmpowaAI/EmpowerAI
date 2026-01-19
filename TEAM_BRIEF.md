# Team Brief - RSS Feed Aggregator Implementation

**Date:** January 19, 2025  
**Status:** RSS Infrastructure Complete, Needs Working Feed URLs

---

## ✅ What Was Completed Today

### 1. **UI Improvements**
- ✅ Fixed Opportunities page branding (removed "LinkedIn" references)
- ✅ Created reusable UI components:
  - `<LoadingState>` - Consistent loading UI
  - `<EmptyState>` - Consistent empty states
  - `<ErrorAlert>` - Consistent error display
- ✅ Updated Opportunities page to use new components

### 2. **RSS Feed Aggregator Infrastructure** (Complete)
- ✅ RSS feed service (`src/services/rssFeedService.js`)
  - Fetches and parses RSS feeds
  - Transforms RSS items to Opportunity format
  - Handles errors gracefully
- ✅ Automated scheduler (`src/services/rssScheduler.js`)
  - Runs daily at 2:00 AM SAST
  - Starts automatically with server
- ✅ API endpoints (`/api/rss`)
  - `POST /api/rss/update` - Manual trigger
  - `GET /api/rss/status` - Check status
  - `POST /api/rss/scheduler/start` - Start scheduler
  - `POST /api/rss/scheduler/stop` - Stop scheduler
- ✅ Command-line script
  - `npm run rss:fetch` - Manual fetch
- ✅ Data deduplication logic
- ✅ Test script for RSS URLs (`scripts/test-rss-url.js`)

### 3. **Documentation**
- ✅ `docs/UI_AUDIT_AND_IMPROVEMENTS.md` - UI consistency audit
- ✅ `docs/RSS_FEED_SETUP.md` - Complete RSS setup guide
- ✅ `TEAM_BRIEF.md` - This document

---

## ⚠️ Important Discovery

**Most South African job boards do NOT provide public RSS feeds.**

Tested URLs all returned 404 or were blocked:
- MyJobMag - 404
- Careers24 - 404  
- CareerJet SA - 418 (bot blocked)
- AllJobs.co.za - 404

**The RSS infrastructure is complete and ready**, but we need to find working RSS feed URLs or use alternative data sources.

---

## 🎯 What Needs to Be Done Tomorrow

### Priority 1: Find Working RSS Feeds
- [ ] Test more RSS feed URLs using `node scripts/test-rss-url.js`
- [ ] Check if job boards have RSS feeds in different locations:
  - Footer links
  - `/feed/` or `/rss.xml` paths
  - Job alert subscription pages
- [ ] Consider alternative sources:
  - Government job portals (gov.za)
  - University career services RSS feeds
  - SETA program RSS feeds (MICT SETA, BankSETA, etc.)
- [ ] When found, add working feeds to `src/services/rssFeedService.js` in `FEED_SOURCES` array

### Priority 2: Alternative Data Sources
- [ ] Research job board APIs that might provide programmatic access
- [ ] Consider web scraping (ensure legal compliance, check robots.txt, ToS)
- [ ] Look into job aggregator APIs (Adzuna, etc.) that may have SA data
- [ ] Partner outreach - contact job boards for API/RSS access

### Priority 3: Manual Seeding (Fallback)
- [ ] Continue improving `scripts/seedOpportunities.js` with more real opportunities
- [ ] Add more categories (bursaries, learnerships, internships)
- [ ] Verify application URLs are still valid
- [ ] Update deadlines to realistic future dates

### Priority 4: UI Improvements (Optional)
- [ ] Standardize page headers across all pages
- [ ] Create reusable `<Button>` component with variants
- [ ] Improve mobile responsiveness (test all pages)
- [ ] Add skeleton loaders instead of spinners

---

## 📁 Key Files Modified/Created

### Backend
- `empowerai-backend/src/services/rssFeedService.js` - Main RSS service
- `empowerai-backend/src/services/rssScheduler.js` - Scheduler
- `empowerai-backend/src/controllers/rssController.js` - API controller
- `empowerai-backend/src/routes/rss.js` - Routes
- `empowerai-backend/scripts/fetchRssFeeds.js` - Manual fetch script
- `empowerai-backend/scripts/test-rss-url.js` - RSS URL tester
- `empowerai-backend/src/server.js` - Added RSS scheduler initialization

### Frontend
- `frontend/src/components/LoadingState.tsx` - New component
- `frontend/src/components/EmptyState.tsx` - New component
- `frontend/src/components/ErrorAlert.tsx` - New component
- `frontend/src/pages/Opportunities.tsx` - Updated with new components

### Documentation
- `docs/UI_AUDIT_AND_IMPROVEMENTS.md`
- `docs/RSS_FEED_SETUP.md`
- `TEAM_BRIEF.md` (this file)

---

## 🚀 How to Test RSS Aggregator (Once Feeds Are Found)

1. **Add working RSS feed to `FEED_SOURCES`** in `src/services/rssFeedService.js`

2. **Test manually:**
   ```bash
   cd empowerai-backend
   npm run rss:fetch
   ```

3. **Check results:**
   - Look for "New opportunities: X" in output
   - Check MongoDB database for new opportunities
   - Verify on Opportunities page in frontend

4. **Check scheduler status:**
   ```bash
   curl http://localhost:5000/api/rss/status
   ```

---

## 📝 Important Notes

1. **RSS Scheduler**: Currently configured to run daily at 2:00 AM SAST. To disable, set `ENABLE_RSS_SCHEDULER=false` in `.env`

2. **Manual Seeding**: Still works! Use `npm run seed:opportunities` to add curated opportunities

3. **Deduplication**: RSS service automatically prevents duplicates by checking URL, title, and company

4. **Error Handling**: Service continues processing even if one feed fails

5. **Data Transformation**: RSS items are automatically transformed to match Opportunity schema (location, province, skills, salary, etc.)

---

## 🔍 Finding RSS Feeds - Tips

- Look for "RSS" or "Feed" links in website footers
- Try common patterns:
  - `https://example.com/feed/`
  - `https://example.com/rss.xml`
  - `https://example.com/jobs/rss`
- Check "Job Alerts" or "Subscribe" sections
- Use browser RSS reader extensions to discover feeds
- Check page source for RSS/Atom links in `<link>` tags

---

## 📞 Next Steps Summary

**Tomorrow's Focus:**
1. Find working RSS feed URLs for SA job boards
2. Test and add working feeds to service
3. OR implement alternative data collection method (API, scraping, etc.)
4. Continue manual seeding as fallback

**The infrastructure is ready - we just need valid data sources!**

---

## 📚 Resources

- RSS Feed Setup Guide: `empowerai-backend/docs/RSS_FEED_SETUP.md`
- UI Audit: `docs/UI_AUDIT_AND_IMPROVEMENTS.md`
- Test Script: `empowerai-backend/scripts/test-rss-url.js`

---

**Questions?** Check the documentation files or review the code comments.

Good luck tomorrow! 🚀
