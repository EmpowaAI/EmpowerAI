const express = require('express');
const auth = require('../../middleware/auth');
const { createApplication, getMyApplications, getMyApplicationStats } = require('./application.Controller');
const router = express.Router();

router.use(auth);

router.get('/', getMyApplications);
router.get('/stats', getMyApplicationStats);
router.post('/', createApplication);

module.exports = router;
