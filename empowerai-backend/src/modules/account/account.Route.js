const express = require('express');
const router = express.Router();
const { protect } = require('../../middleware/auth');
const accountController = require('./account.Controller');

// Public — no auth required
router.post('/forgot-password', accountController.forgotPassword);
router.post('/reset-password',  accountController.resetPassword);

// Authenticated — require valid session
router.post('/change-email',    protect, accountController.requestEmailChange);
router.post('/delete-request',  protect, accountController.requestAccountDeletion);
router.post('/confirm-delete',  protect, accountController.confirmAccountDeletion);

module.exports = router;
