const express = require('express');
const { getAllOpportunities, getOpportunity, getDebugStats } = require('../controllers/opportunityController');
const optionalAuth = require('../middleware/optionalAuth');
const router = express.Router();

// Debug endpoint (should be removed or protected in production)
router.get('/debug/stats', getDebugStats);

router.get('/', optionalAuth, getAllOpportunities);
router.get('/:id', getOpportunity);

module.exports = router;
