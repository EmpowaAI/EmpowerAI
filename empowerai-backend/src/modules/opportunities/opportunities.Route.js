const express = require('express');
const { getAllOpportunities, getOpportunity, getDebugStats } = require('./opportunity.Controller');
const optionalAuth = require('../../middleware/optionalAuth');
const adminAuth = require('../../middleware/adminAuth');
const router = express.Router();

// Debug endpoint (should be removed or protected in production)
router.get('/debug/stats', adminAuth, getDebugStats);

router.get('/', optionalAuth, getAllOpportunities);
router.get('/:id', getOpportunity);

module.exports = router;
