/**
 * Account Controller
 * Handles email verification & password recovery
 */

const userService = require('../services/userService');
const { sendSuccess } = require('../utils/response');

/**
 * Verify email
 * @route GET /api/account/verify?token=abc
 * @access Public
 */
exports.verifyEmail = async (req, res, next) => {
  const correlationId = req.correlationId;

  try {
    const { token } = req.query;

    await userService.verifyEmail(token, correlationId);

    return sendSuccess(res, {
      message: 'Email verified successfully. You can now log in.'
    });
  } catch (error) {
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

  try {
    const { email } = req.body;

    await userService.forgotPassword(email, correlationId);

    return sendSuccess(res, {
      message: 'If that email exists, a reset link has been sent.'
    });
  } catch (error) {
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

  try {
    const { token, newPassword } = req.body;

    await userService.resetPassword({ token, newPassword });

    return sendSuccess(res, {
      message: 'Password reset successful. You can now log in.'
    });
  } catch (error) {
    next(error);
  }
};
