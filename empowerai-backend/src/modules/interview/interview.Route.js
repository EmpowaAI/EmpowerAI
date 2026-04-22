const express = require('express');
const { startInterview, submitAnswer, getSession, debugNormalizeScore } = require('./interview.Controller');
const { protect, restrictTo } = require('../../middleware/auth');
const validateRequest = require('../../middleware/validate');
const { interviewStartSchema, interviewAnswerSchema } = require('../../utils/validators');
const router = express.Router();

// All routes protected by authentication
router.use(protect);

router.post('/start', validateRequest(interviewStartSchema), startInterview);
router.post('/debug/normalize', protect, debugNormalizeScore);
router.post('/:sessionId/answer', validateRequest(interviewAnswerSchema), submitAnswer);
router.get('/:sessionId', protect, getSession);

module.exports = router;

