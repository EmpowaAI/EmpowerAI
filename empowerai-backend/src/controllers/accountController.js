/**
 * Account Controller
 * Handles account-related operations such as email verification, password reset.
 * It uses the AccountService to perform the necessary business logic and interacts with the request and response objects.
 * It Uses Account DTO for data transfer and validation.
 */

const AccountService = require('../services/accountService');
const UserRepository = require('../repositories/UserRepository');
const User = require('../models/User');
const { sendSuccess } = require('../utils/response');
const logger = require('../utils/logger');
const ForgotPasswordDto = require('../DTOs/Account/ForgotPasswordDto');
const ResetPasswordDto = require('../DTOs/Account/ResetPasswordDto');
const VerifyEmailDto = require('../DTOs/Account/VerifyEmailDto');

const userRepository = new UserRepository(User);
const accountService = new AccountService(userRepository);


/**
 * Verify Email
 * @route GET /api/account/verify-email
 * @access Public
 */
exports.verifyEmail = async (req, res, next) => {
  const correlationId = req.correlationId;
  const dto = new VerifyEmailDto({ token: req.query.token });

  try {
    logger.info('Email verification requested', { correlationId, token: dto.token });
    await accountService.verifyEmail(dto, correlationId);
    logger.info('Email verification successful', { correlationId });
    return res.redirect(`${process.env.FRONTEND_URL}/email-verified?verified=true`);
  } catch (error) {
    logger.error('Email verification failed', { correlationId, token: dto.token, error: error.message });
    return res.redirect(`${process.env.FRONTEND_URL}/login?verified=false`);
  }
};


/**
 * Request Password Reset
 * @route POST /api/account/forgot-password
 * @access Public
 */
exports.forgotPassword = async (req, res, next) => {
  const correlationId = req.correlationId;
  const dto = new ForgotPasswordDto(req.body.email);

  try {
    logger.info('Forgot password requested', { correlationId, email: dto.email });
    await accountService.forgotPassword(dto, correlationId);
    logger.info('Forgot password email sent', { correlationId, email: dto.email });
    return sendSuccess(res, {
      message: 'Password reset email sent if the email exists',
      redirect: `${process.env.FRONTEND_URL}/reset-password`
    });
  } catch (error) {
    logger.error('Password reset request failed', { correlationId, email: dto.email, error: error.message });
    next(error);
  }
};


/**
 * Reset Password
 * @route POST /api/account/reset-password
 * @access Public
 */
exports.resetPassword = async (req, res, next) => {
  const correlationId = req.correlationId;
  const dto = new ResetPasswordDto(req.body.token, req.body.newPassword);

  try {
    logger.info('Reset password requested', { correlationId, token: dto.token });
    await accountService.resetPassword(dto, correlationId);
    logger.info('Password reset successful', { correlationId });
    return sendSuccess(res, {
      message: 'Password reset successful, you can now log in with your new password',
      redirect: `${process.env.FRONTEND_URL}/login`
    });
  } catch (error) {
    logger.error('Password reset failed', { correlationId, token: dto.token, error: error.message });
    next(error);
  }
};