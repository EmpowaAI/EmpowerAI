/**
 * RSS Feed Scheduler
 * 
 * Sets up cron jobs to automatically fetch RSS feeds on a schedule
 */

const cron = require('node-cron');
const { fetchAllFeeds } = require('./rssFeedService');
const { fetchAndSaveJobs } = require('./jobAPIService');
const logger = require('../utils/logger');

let scheduledJob = null;

/**
 * Start RSS feed scheduler
 * Runs daily at 2:00 AM SAST (UTC+2)
 */
function startRssScheduler() {
  // Stop existing scheduler if running
  stopRssScheduler();

  // Schedule daily at 2:00 AM (cron format: minute hour day month weekday)
  // 0 0 * * * = midnight UTC, which is 2 AM SAST (UTC+2)
  // Adjusted: 0 2 * * * = 2 AM SAST if server is in SAST timezone
  // Better: Use 0 0 * * * (midnight UTC = 2 AM SAST) or 0 2 * * * if server is in UTC
  
  scheduledJob = cron.schedule('0 2 * * *', async () => {
    logger.info('Starting scheduled feed aggregation (RSS + Job APIs)...');
    try {
      // Fetch from RSS feeds
      const rssResult = await fetchAllFeeds();
      logger.info('Scheduled RSS feed aggregation completed', {
        new: rssResult.new,
        skipped: rssResult.skipped,
        errors: rssResult.errors
      });
      
      // Fetch from job APIs
      const apiResult = await fetchAndSaveJobs();
      logger.info('Scheduled job API aggregation completed', {
        new: apiResult.new,
        skipped: apiResult.skipped,
        total: apiResult.total
      });
    } catch (error) {
      logger.error('Scheduled feed aggregation failed:', error.message);
    }
  }, {
    scheduled: true,
    timezone: 'Africa/Johannesburg' // SAST timezone
  });

  logger.info('RSS feed scheduler started - will run daily at 2:00 AM SAST');
  return scheduledJob;
}

/**
 * Stop RSS feed scheduler
 */
function stopRssScheduler() {
  if (scheduledJob) {
    scheduledJob.stop();
    scheduledJob = null;
    logger.info('RSS feed scheduler stopped');
  }
}

/**
 * Get scheduler status
 */
function getSchedulerStatus() {
  return {
    isRunning: scheduledJob !== null,
    lastRun: null // Could track last run time
  };
}

module.exports = {
  startRssScheduler,
  stopRssScheduler,
  getSchedulerStatus
};
