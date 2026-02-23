/**
 * User Controller
 * Handles:
 * - Get user profile
 * - Update user profile
 * - Delete user account
 * Used by user routes for profile management endpoints.
 * Note: This controller focuses on user profile management and delegates business logic to UserService. It does not handle authentication, email verification, or password resets, which are responsibilities of AuthService and AccountService.
 */

const logger = require('../utils/logger');
const { sendSuccess } = require('../utils/response');
const UserService = require('../services/userService');
const UserRepository = require('../repositories/UserRepository');
const EditUserDto = require('../DTOs/User/EditUserDto');
const User = require('../models/User');

const userRepository = new UserRepository(User);
const userService = new UserService(userRepository);


/**
 * Get Profile
 * @route GET /api/user/profile
 * @access Private
 */
exports.getProfile = async (req, res, next) => {
  const correlationId = req.correlationId;
  const userId = req.user._id;

  try {
    logger.info(`Get profile requested for user ID: ${userId}`, { correlationId });
    const profile = await userService.getProfile(userId, correlationId);
    logger.info(`Profile retrieved for user ID: ${userId}`, { correlationId });
    return sendSuccess(res, { user: profile });
  } catch (error) {
    logger.error(`Failed to retrieve profile for user ID: ${userId}`, { correlationId, error: error.message });
    next(error);
  }
};


/**
 * Update Profile
 * @route PATCH /api/user/profile
 * @access Private
 */
exports.updateProfile = async (req, res, next) => {
  const correlationId = req.correlationId;
  const userId = req.user._id;
  const dto = new EditUserDto(
    req.body.name,
    req.body.age,
    req.body.province,
    req.body.education,
    req.body.skills,
    req.body.interests
  );

  try {
    logger.info(`Update profile requested for user ID: ${userId}`, { correlationId });
    const updatedProfile = await userService.updateProfile(userId, dto, correlationId);
    logger.info(`Profile updated for user ID: ${userId}`, { correlationId });
    return sendSuccess(res, { user: updatedProfile });
  } catch (error) {
    logger.error(`Failed to update profile for user ID: ${userId}`, { correlationId, error: error.message });
    next(error);
  }
};


/**
 * Delete Account
 * @route DELETE /api/user/account
 * @access Private
 */
exports.deleteAccount = async (req, res, next) => {
  const correlationId = req.correlationId;
  const userId = req.user._id;

  try {
    logger.info(`Delete account requested for user ID: ${userId}`, { correlationId });
    await userService.deleteAccount(userId, correlationId);
    logger.info(`Account deleted for user ID: ${userId}`, { correlationId });
    return sendSuccess(res, { message: 'Account deleted successfully' });
  } catch (error) {
    logger.error(`Failed to delete account for user ID: ${userId}`, { correlationId, error: error.message });
    next(error);
  }
};