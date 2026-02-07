/**
 * Admin Routes
 * 
 * Administrative endpoints for database seeding and maintenance
 * NOTE: In production, these should be protected with admin authentication
 */

const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const adminAuth = require('../middleware/adminAuth');
const webhookAuth = require('../middleware/webhookAuth');

// Webhook trigger for CI/CD
router.post('/refresh-opportunities/webhook', webhookAuth, adminController.refreshOpportunities);

router.use(adminAuth);

// Seed opportunities database
router.post('/seed-opportunities', adminController.seedOpportunities);

// Get database statistics
router.get('/stats', adminController.getStats);

// Career taxonomy management
router.get('/career-taxonomy', adminController.getCareerTaxonomy);
router.put('/career-taxonomy', adminController.updateCareerTaxonomy);

// Refresh opportunities (backfill skills + fetch new)
router.post('/refresh-opportunities', adminController.refreshOpportunities);

module.exports = router;
