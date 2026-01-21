/**
 * RSS Feed Controller
 * 
 * Handles API requests for RSS feed operations
 */

const { fetchAllFeeds } = require('../services/rssFeedService');
const { startRssScheduler, stopRssScheduler, getSchedulerStatus } = require('../services/rssScheduler');
const { sendSuccess, sendError } = require('../utils/response');
const logger = require('../utils/logger');

/**
 * Fire-and-forget manual RSS feed update with optional purge 
 * */
exports.triggerUpdate = (req, res,) => {
  
    logger.info('Manual RSS feed update triggered');
    
    /**
     * Fire-and-forget: fetch feeds
     */
    fetchAllFeeds()
      .then(() => logger.info('Manual RSS feed update completed'))
      .catch(err => logger.error('Error during manual RSS feed update:', err));

    // Fire-and-forget: purge opportunities older than 30 days
    purgeOldOpportunities()
      .then(count => logger.info(`Manual purge completed, removed ${count} old opportunities removed`))
      .catch(err => logger.error('Error during manual purge of old opportunities:', err));
    
    sendSuccess(res, {
      message: 'RSS feeds updated successfully' });
    };
     

/**
 * Get scheduler status
 */
exports.getStatus = async (req, res, next) => {
  try {
    const status = getSchedulerStatus();
    sendSuccess(res, status);
  } catch (error) {
    logger.error('Error getting scheduler status:', error);
    sendError(res, error.message || 'Failed to get scheduler status', 500);
  }
};

/**
 * Start scheduler
 */
exports.startScheduler = async (req, res, next) => {
  try {
    startRssScheduler();
    sendSuccess(res, { message: 'RSS feed scheduler started' });
  } catch (error) {
    logger.error('Error starting scheduler:', error);
    sendError(res, error.message || 'Failed to start scheduler', 500);
  }
};

/**
 * Stop scheduler
 */
exports.stopScheduler = async (req, res, next) => {
  try {
    stopRssScheduler();
    sendSuccess(res, { message: 'RSS feed scheduler stopped' });
  } catch (error) {
    logger.error('Error stopping scheduler:', error);
    sendError(res, error.message || 'Failed to stop scheduler', 500);
  }
};
