
const express = require('express');
const router = express.Router();
const accountController = require('./accountController');
const { protect, restrictTo } = require('../../middleware/auth');

const { forgotPasswordRules, validateForgotPassword } = require('./userAccount.Dto/ForgotPasswordDto');
const { resetPasswordRules, validateResetPassword }   = require('./userAccount.Dto/ResetPasswordDto');
const { updateEmailRules, validateUpdateEmail }        = require('./userAccount.Dto/UpdateEmailDto');

router.get('/verify', accountController.verifyEmail);
router.post('/forgot-password', forgotPasswordRules, validateForgotPassword, accountController.forgotPassword);
router.post('/reset-password', resetPasswordRules, validateResetPassword, accountController.resetPassword);
router.get('/confirm-email', protect, accountController.confirmEmailChange);
router.get('/confirm-delete', accountController.confirmAccountDeletion);
router.post('/change-email', protect, updateEmailRules, validateUpdateEmail, accountController.requestEmailChange);
router.post('/delete-request', protect, accountController.requestAccountDeletion);

module.exports = router;

