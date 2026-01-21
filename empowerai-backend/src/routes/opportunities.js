const express = require('express');
const { getAllOpportunities, getOpportunity, getDebugStats } = require('../controllers/opportunityController');
const router = express.Router();

// Debug endpoint (should be removed or protected in production)
router.get('/debug/stats', getDebugStats);

router.get('/', getAllOpportunities);
router.get('/:id', getOpportunity);

module.exports = router;