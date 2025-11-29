const express = require('express');
const { startInterview, submitAnswer, getSession } = require('../controllers/interviewController');
const auth = require('../middleware/auth');
const router = express.Router();

// All routes protected by authentication
router.use(auth);

router.post('/start', startInterview);
router.post('/:sessionId/answer', submitAnswer);
router.get('/:sessionId', getSession);

module.exports = router;

