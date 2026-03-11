/**
 * RSS Feed Routes
 */

const express = require('express');
const router = express.Router();
const rssController = require('../controllers/rssController');
const adminAuth = require('../middleware/adminAuth');

// Restrict RSS maintenance endpoints to admin key
router.use(adminAuth);

// Manual trigger for RSS feed updates
router.post('/update', rssController.triggerUpdate);

// Manual purge of old opportunities
router.post('/purge', rssController.triggerPurge);

// Get scheduler status
router.get('/status', rssController.getStatus);

// Start/stop scheduler (admin only - consider adding auth)
router.post('/scheduler/start', rssController.startScheduler);
router.post('/scheduler/stop', rssController.stopScheduler);

module.exports = router;
