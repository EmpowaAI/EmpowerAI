const express = require('express');
const { startInterview, submitAnswer, getSession, debugNormalizeScore } = require('./interview.Controller');
const auth = require('../../middleware/auth');
const validateRequest = require('../../middleware/validate');
const { interviewStartSchema, interviewAnswerSchema } = require('../../utils/validators');
const router = express.Router();

// All routes protected by authentication
router.use(auth);

router.post('/start', validateRequest(interviewStartSchema), startInterview);
// Debug: normalize score (protected)
router.post('/debug/normalize', debugNormalizeScore);
router.post('/:sessionId/answer', validateRequest(interviewAnswerSchema), submitAnswer);
router.get('/:sessionId', getSession);

module.exports = router;

