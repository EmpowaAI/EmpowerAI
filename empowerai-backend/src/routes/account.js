/**
 * Account Routes
 * Handles:
 * - Email verification
 * - Forgot password
 * - Reset password
 */

const express = require('express');
const { verifyEmail, forgotPassword, resetPassword } = require('../controllers/accountController');
const validateRequest = require('../middleware/validate');
const { forgotPasswordSchema, resetPasswordSchema } = require('../utils/validators');
const { authLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

router.use(authLimiter);

// Public routes
router.get('/verify-email', verifyEmail);
router.post('/forgot-password', validateRequest(forgotPasswordSchema), forgotPassword);
router.post('/reset-password', validateRequest(resetPasswordSchema), resetPassword);

module.exports = router;
