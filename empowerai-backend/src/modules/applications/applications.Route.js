const express = require('express');
const { protect, restrictTo } = require('../../middleware/auth');
const { createApplication, getMyApplications, getMyApplicationStats } = require('./application.Controller');
const router = express.Router();

router.use(protect);

router.get('/', protect,getMyApplications);
router.get('/stats', protect, getMyApplicationStats);
router.post('/', protect, createApplication);

module.exports = router;
