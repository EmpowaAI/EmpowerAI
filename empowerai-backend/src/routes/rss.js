/**
 * RSS Feed Routes
 */

const express = require('express');
const router = express.Router();
const rssController = require('../controllers/rssController');
// Note: Add auth middleware if you want to restrict access
// const { authenticate } = require('../middleware/auth');

// Manual trigger for RSS feed updates
router.post('/update', rssController.triggerUpdate);

// Get scheduler status
router.get('/status', rssController.getStatus);

// Start/stop scheduler (admin only - consider adding auth)
router.post('/scheduler/start', rssController.startScheduler);
router.post('/scheduler/stop', rssController.stopScheduler);

module.exports = router;
