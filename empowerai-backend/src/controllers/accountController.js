/**
 * Account Controller
 * Handles email verification & password recovery
 */

const userService = require('../services/userService');
const { sendSuccess } = require('../utils/response');
const logger = require('../utils/logger');

/**
 * Verify email
 * @route GET /api/account/verify?token=abc
 * @access Public
 */
exports.verifyEmail = async (req, res, next) => {
  const correlationId = req.correlationId;
  const { token } = req.query;

  try {
    logger.info('Email verification requested', { correlationId });

    await userService.verifyEmail(token, correlationId);

    logger.info('Email verified successfully', { correlationId });

    return sendSuccess(res, {
      message: 'Email verified successfully. You can now log in.'
    });
  } catch (error) {
    logger.error('Email verification failed', { correlationId, error: error.message });
    next(error);
  }
};


/**
 * Request password reset
 * @route POST /api/account/forgot
 * @access Public
 */
exports.forgotPassword = async (req, res, next) => {
  const correlationId = req.correlationId;
  const { email } = req.body;

  try {
    logger.info('Password reset requested', { correlationId, email });

    await userService.forgotPassword(email, correlationId);

    logger.info('Password reset process initiated (email sent if exists)', { correlationId, email });

    return sendSuccess(res, {
      message: 'If that email exists, a reset link has been sent.'
    });
  } catch (error) {
    logger.error('Password reset request failed', { correlationId, email, error: error.message });
    next(error);
  }
};


/**
 * Reset password
 * @route POST /api/account/reset
 * @access Public
 */
exports.resetPassword = async (req, res, next) => {
  const correlationId = req.correlationId;
  const { token, newPassword } = req.body;

  try {
    logger.info('Password reset attempt', { correlationId });

    await userService.resetPassword({ token, newPassword }, correlationId);

    logger.info('Password reset successful', { correlationId });

    return sendSuccess(res, {
      message: 'Password reset successful. You can now log in.'
    });
  } catch (error) {
    logger.error('Password reset failed', { correlationId, error: error.message });
    next(error);
  }
};
