/**
 * Admin Routes
 * 
 * Administrative endpoints for database seeding and maintenance
 * NOTE: In production, these should be protected with admin authentication
 */

const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

// Seed opportunities database
router.post('/seed-opportunities', adminController.seedOpportunities);

// Get database statistics
router.get('/stats', adminController.getStats);

module.exports = router;
