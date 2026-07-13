/**
 * User Controller
 * Responsibility: authenticated user profile management.
 *   - Get user profile
 *   - Update user profile
 *   - Change password
 *
 * No business logic, no DTOs - fully delegates to userService.
 */

const logger = require('../../utils/logger');
const { sendSuccess } = require('../../utils/response');
const userService = require('./user.Service');
const supabase = require('../../db/supabase');

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
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ status: 'error', message: 'Current and new password are required.' });
    }
    if (newPassword.length < 8) {
      return res.status(400).json({ status: 'error', message: 'New password must be at least 8 characters.' });
    }

    // Verify the current password by attempting a sign-in (Supabase is the
    // source of truth for credentials). The shared client has persistSession
    // off, so this does not mutate app auth state.
    const { error: verifyError } = await supabase.auth.signInWithPassword({
      email: req.user.email,
      password: currentPassword,
    });
    if (verifyError) {
      return res.status(401).json({ status: 'error', message: 'Current password is incorrect.' });
    }

    const { error: updateError } = await supabase.auth.admin.updateUserById(req.user.id, {
      password: newPassword,
    });
    if (updateError) {
      logger.error('Change password update failed', { correlationId, message: updateError.message });
      return res.status(400).json({ status: 'error', message: 'Failed to change password. Please try again.' });
    }

    logger.info('Password changed', { correlationId, userId: req.user.id });
    return sendSuccess(res, { message: 'Password changed successfully.' });
  } catch (error) {
    logger.error('Failed to change password', { correlationId, error: error.message });
    next(error);
  }
};

