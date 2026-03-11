/**
 * User Controller
 * Handles user profile retrieval and updates
 */

const userService = require('../services/userService');
const { sendSuccess } = require('../utils/response');
const logger = require('../utils/logger');

const ensureSelf = (req, res) => {
  if (req.params.id && req.user?.id && req.params.id !== req.user.id) {
    res.status(403).json({
      status: 'error',
      message: 'Forbidden',
    });
    return false;
  }
  return true;
};

/**
 * Get user profile
 * @route GET /api/user/profile/:id or GET /api/user/profile (uses auth'd user)
 * @access Private
 */
exports.getUserProfile = async (req, res, next) => {
  const correlationId = req.correlationId;
  
  try{
    if (!ensureSelf(req, res)) return;
    const user = await userService.getUserProfile(req.params.id, correlationId);

    logger.info('User profile retrieved successfully', { correlationId, userId: req.params.id });

    return sendSuccess(res, { user });
  } catch (error) {
    next(error);    
  }
};

/**
 * Update user profile
 * @route PUT /api/user/profile/:id or PUT /api/user/profile (uses auth'd user)
 * @access Private
 */
exports.updateUser = async (req, res, next) => {
  const correlationId = req.correlationId;

    try {
        if (!ensureSelf(req, res)) return;
        const user = await userService.updateUser(req.params.id, req.body, correlationId);

        logger.info('User profile updated successfully', { correlationId, userId: req.params.id });

        return sendSuccess(res, { user });      
    } catch (error) {
        next(error);
    }
};

/**
 * Change user password
 * @route POST /api/user/change-password
 * @access Private
 */
exports.changePassword = async (req, res, next) => {
  const correlationId = req.correlationId;
  const { currentPassword, newPassword } = req.body;
  
  try {
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        status: 'error',
        message: 'Current password and new password are required'
      });
    }
    
    await userService.changePassword(req.user.id, currentPassword, newPassword, correlationId);
    
    logger.info('User password changed successfully', { correlationId, userId: req.user.id });
    
    return sendSuccess(res, { message: 'Password changed successfully' });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete user account
 * @route DELETE /api/user/profile/:id or DELETE /api/user/profile (uses auth'd user)
 * @access Private
 */
exports.deleteUser = async (req, res, next) => {
  const correlationId = req.correlationId;
  
    try {
        if (!ensureSelf(req, res)) return;
        await userService.deleteUser(req.params.id, correlationId);
        logger.info('User account deleted successfully', { correlationId, userId: req.params.id });

        return sendSuccess(res, { message: 'User account deleted successfully' });      
    } catch (error) {
        next(error);
    }
};
