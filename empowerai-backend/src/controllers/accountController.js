/**
 * Account Controller
 * Responsibility: all flows that send an email to the user for verification or confirmation.
 *   - Verify email (post-registration)
 *   - Forgot password
 *   - Reset password
 *   - Request email change + confirm email change
 *   - Request account deletion + confirm account deletion
 *
 * No business logic, no DTOs — fully delegates to userService.
 */

const logger = require('../utils/logger');
const { sendSuccess } = require('../utils/response');
const userService = require('../services/userService');

// ─────────────────────────────────────────────
// Verify email
// @route  GET /api/account/verify?token=abc
// @access Public
// ─────────────────────────────────────────────
exports.verifyEmail = async (req, res, next) => {
  const correlationId = req.correlationId;
  const { token } = req.query;
  try {
    logger.info('Email verification requested', { correlationId });

    const user = await userService.verifyEmail(token, correlationId);

    logger.info('Email verified successfully', { correlationId, userId: user.id });

    return sendSuccess(res, {
      message: 'Email verified successfully. You can now log in.',
      user,
    });
  } catch (error) {
    logger.error('Email verification failed', { correlationId, error: error.message });
    next(error);
  }
};

// ─────────────────────────────────────────────
// Forgot password
// @route  POST /api/account/forgot-password
// @access Public
// ─────────────────────────────────────────────
exports.forgotPassword = async (req, res, next) => {
  const correlationId = req.correlationId;
  try {
    logger.info('Password reset requested', { correlationId });

    await userService.forgotPassword(req.body, correlationId);

    logger.info('Password reset process initiated', { correlationId });

    return sendSuccess(res, {
      message: 'If that email exists, a reset link has been sent.',
    });
  } catch (error) {
    logger.error('Password reset request failed', { correlationId, error: error.message });
    next(error);
  }
};

// ─────────────────────────────────────────────
// Reset password
// @route  POST /api/account/reset-password
// @access Public
// ─────────────────────────────────────────────
exports.resetPassword = async (req, res, next) => {
  const correlationId = req.correlationId;
  try {
    logger.info('Password reset attempt', { correlationId });

    await userService.resetPassword(req.body, correlationId);

    logger.info('Password reset successful', { correlationId });

    return sendSuccess(res, {
      message: 'Password reset successful. You can now log in.',
    });
  } catch (error) {
    logger.error('Password reset failed', { correlationId, error: error.message });
    next(error);
  }
};

// ─────────────────────────────────────────────
// Request email change
// @route  POST /api/account/change-email
// @access Private
// ─────────────────────────────────────────────
exports.requestEmailChange = async (req, res, next) => {
  const correlationId = req.correlationId;
  try {
    logger.info('Email change requested', { correlationId, userId: req.user.id });

    await userService.requestEmailChange(req.user.id, req.body, correlationId);

    return sendSuccess(res, {
      message: 'A verification link has been sent to your new email address.',
    });
  } catch (error) {
    logger.error('Email change request failed', { correlationId, error: error.message });
    next(error);
  }
};

// ─────────────────────────────────────────────
// Confirm email change
// @route  GET /api/account/confirm-email?token=abc
// @access Public
// ─────────────────────────────────────────────
exports.confirmEmailChange = async (req, res, next) => {
  const correlationId = req.correlationId;
  const { token } = req.query;
  try {
    logger.info('Email change confirmation requested', { correlationId });

    const user = await userService.confirmEmailChange(token, correlationId);

    logger.info('Email changed successfully', { correlationId, userId: user.id });

    return sendSuccess(res, {
      message: 'Your email address has been updated successfully.',
      user,
    });
  } catch (error) {
    logger.error('Email change confirmation failed', { correlationId, error: error.message });
    next(error);
  }
};

// ─────────────────────────────────────────────
// Request account deletion
// @route  POST /api/account/delete-request
// @access Private
// ─────────────────────────────────────────────
exports.requestAccountDeletion = async (req, res, next) => {
  const correlationId = req.correlationId;
  try {
    await userService.requestAccountDeletion(req.user.id, correlationId);

    logger.info('Account deletion requested', { correlationId, userId: req.user.id });

    return sendSuccess(res, {
      message: 'A confirmation link has been sent to your email. Your account will be deleted once confirmed.',
    });
  } catch (error) {
    logger.error('Account deletion request failed', { correlationId, error: error.message });
    next(error);
  }
};

// ─────────────────────────────────────────────
// Confirm account deletion
// @route  GET /api/account/confirm-delete?token=abc
// @access Public
// ─────────────────────────────────────────────
exports.confirmAccountDeletion = async (req, res, next) => {
  const correlationId = req.correlationId;
  const { token } = req.query;
  try {
    logger.info('Account deletion confirmation requested', { correlationId });

    await userService.confirmAccountDeletion(token, correlationId);

    logger.info('Account permanently deleted', { correlationId });

    return sendSuccess(res, {
      message: 'Your account has been permanently deleted.',
    });
  } catch (error) {
    logger.error('Account deletion confirmation failed', { correlationId, error: error.message });
    next(error);
  }
};
