/**
 * User Controller
 * Responsibility: authenticated user profile management.
 *   - Get user profile
 *   - Update user profile
 *   - Change password
 *
 * No business logic, no DTOs — fully delegates to userService.
 */

const logger = require('../../utils/logger');
const { sendSuccess } = require('../../utils/response');
const userService = require('./user.Service');

// ─────────────────────────────────────────────
// Get user profile
// @route  GET /api/user/profile
// @access Private
// ─────────────────────────────────────────────
exports.getUser = async (req, res, next) => {
  const correlationId = req.correlationId;
  try {
    const user = await userService.getUserProfile(req.user.id, correlationId);

    logger.debug('User profile retrieved', { correlationId, userId: req.user.id });

    return sendSuccess(res, { user });
  } catch (error) {
    logger.error('Failed to retrieve user profile', { correlationId, error: error.message });
    next(error);
  }
};

// ─────────────────────────────────────────────
// Update user profile
// @route  PATCH /api/user/profile
// @access Private
// ─────────────────────────────────────────────
exports.updateUser = async (req, res, next) => {
  const correlationId = req.correlationId;
  try {
    const user = await userService.updateUser(req.user.id, req.body, correlationId);

    logger.info('User profile updated', { correlationId, userId: req.user.id });

    return sendSuccess(res, {
      message: 'Profile updated successfully.',
      user,
    });
  } catch (error) {
    logger.error('Failed to update user profile', { correlationId, error: error.message });
    next(error);
  }
};

// ─────────────────────────────────────────────
// Change password
// @route  PATCH /api/user/change-password
// @access Private
// ─────────────────────────────────────────────
exports.changePassword = async (req, res, next) => {
  const correlationId = req.correlationId;
  try {
    await userService.changePassword(req.user.id, req.body, correlationId);

    logger.info('Password changed successfully', { correlationId, userId: req.user.id });

    return sendSuccess(res, {
      message: 'Password changed successfully.',
    });
  } catch (error) {
    logger.error('Failed to change password', { correlationId, error: error.message });
    next(error);
  }
};
