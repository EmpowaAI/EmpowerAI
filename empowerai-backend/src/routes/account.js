/**
 * Account Routes
 * Handles all email-driven verification and confirmation flows.
 */

const express = require('express');
const router = express.Router();
const accountController = require('../controllers/accountController');
const auth = require('../middleware/auth');

// DTO validation middleware
const { forgotPasswordRules, validateForgotPassword } = require('../dtos/Authentication/ForgotPasswordDto');
const { resetPasswordRules, validateResetPassword }   = require('../dtos/Authentication/ResetPasswordDto');
const { updateEmailRules, validateUpdateEmail }        = require('../dtos/User/UpdateEmailDto');

// ─────────────────────────────────────────────
// Public routes
// ─────────────────────────────────────────────

// Verify email after registration
// @route  GET /api/account/verify?token=abc
router.get('/verify', accountController.verifyEmail);

// Forgot password — sends reset email
// @route  POST /api/account/forgot-password
router.post('/forgot-password', forgotPasswordRules, validateForgotPassword, accountController.forgotPassword);

// Reset password using token from email
// @route  POST /api/account/reset-password
router.post('/reset-password', resetPasswordRules, validateResetPassword, accountController.resetPassword);

// Confirm email change using token from email
// @route  GET /api/account/confirm-email?token=abc
router.get('/confirm-email', accountController.confirmEmailChange);

// Confirm account deletion using token from email
// @route  GET /api/account/confirm-delete?token=abc
router.get('/confirm-delete', accountController.confirmAccountDeletion);

// ─────────────────────────────────────────────
// Protected routes (require login)
// ─────────────────────────────────────────────

// Request email change — sends verification to new address
// @route  POST /api/account/change-email
router.post('/change-email', auth, updateEmailRules, validateUpdateEmail, accountController.requestEmailChange);

// Request account deletion — sends confirmation email
// @route  POST /api/account/delete-request
router.post('/delete-request', auth, accountController.requestAccountDeletion);

module.exports = router;

