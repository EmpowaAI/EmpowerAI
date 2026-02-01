/**
 * Account Routes
 * Handles email verification & password recovery
 */

const express = require('express');
const router = express.Router();
const accountController = require('../controllers/accountController');

/**
 * @route   GET /api/account/verify
 * @desc    Verify user's email from token
 * @access  Public
 */
router.get('/verify', accountController.verifyEmail);

/**
 * @route   POST /api/account/forgot
 * @desc    Send password reset email
 * @access  Public
 */
router.post('/forgot', accountController.forgotPassword);

/**
 * @route   POST /api/account/reset
 * @desc    Reset password using token
 * @access  Public
 */
router.post('/reset', accountController.resetPassword);

module.exports = router;

