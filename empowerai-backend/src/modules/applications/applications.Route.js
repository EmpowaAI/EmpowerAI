const express = require('express');
const { protect, restrictTo } = require('../../middleware/auth');
const {
  createApplication,
  getMyApplications,
  getMyApplicationStats,
  saveOpportunity,
  unsaveOpportunity,
  getSavedOpportunities,
} = require('./application.Controller');
const router = express.Router();

router.use(protect);

router.get('/', getMyApplications);
router.get('/stats', getMyApplicationStats);
router.post('/', createApplication);

// Bookmarks
router.get('/saved', getSavedOpportunities);
router.post('/saved', saveOpportunity);
router.delete('/saved/:opportunityId', unsaveOpportunity);

module.exports = router;
