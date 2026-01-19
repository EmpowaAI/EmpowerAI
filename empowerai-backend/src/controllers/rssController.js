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
 * Manually trigger RSS feed aggregation
 */
exports.triggerUpdate = async (req, res, next) => {
  try {
    logger.info('Manual RSS feed update triggered');
    const result = await fetchAllFeeds();
    
    sendSuccess(res, {
      message: 'RSS feeds updated successfully',
      stats: {
        new: result.new,
        skipped: result.skipped,
        errors: result.errors
      }
    });
  } catch (error) {
    logger.error('Manual RSS feed update failed:', error);
    sendError(res, error.message || 'Failed to update RSS feeds', 500);
  }
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
