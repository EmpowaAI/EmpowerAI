const express = require('express');
const { startInterview, submitAnswer, getSession, debugNormalizeScore } = require('../controllers/interviewController');
const auth = require('../middleware/auth');
const router = express.Router();

// All routes protected by authentication
router.use(auth);

router.post('/start', startInterview);
// Debug: normalize score (protected)
router.post('/debug/normalize', debugNormalizeScore);
router.post('/:sessionId/answer', submitAnswer);
router.get('/:sessionId', getSession);

module.exports = router;

