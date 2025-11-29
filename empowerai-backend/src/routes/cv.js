const express = require('express');
const { analyzeCV } = require('../controllers/cvController');
const auth = require('../middleware/auth');
const router = express.Router();

// All routes protected by authentication
router.use(auth);

router.post('/analyze', analyzeCV);

module.exports = router;

