/**
 * User Controller
 * Handles user profile retrieval and updates
 */

const userService = require('../services/userService');
const { sendSuccess } = require('../utils/response');
const logger = require('../utils/logger');

/**
 * Get user profile
 * @route GET /api/user/profile/:id
 * @access Private
 */
exports.getUserProfile = async (req, res, next) => {
  const correlationId = req.correlationId;
  
  try{
    const user = await userService.getUserProfile(req.params.id, correlationId);

    logger.info('User profile retrieved successfully', { correlationId, userId: req.params.id });

    return sendSuccess(res, { user });
  } catch (error) {
    next(error);    
  }
};

/**
 * Update user profile
 * @route PUT /api/user/profile/:id
 * @access Private
 */
exports.updateUser = async (req, res, next) => {
  const correlationId = req.correlationId;

    try {
        const user = await userService.updateUser(req.params.id, req.body, correlationId);

        logger.info('User profile updated successfully', { correlationId, userId: req.params.id });

        return sendSuccess(res, { user });      
    } catch (error) {
        next(error);
    }
};

/**
 * Delete user account
 * @route DELETE /api/user/profile/:id
 * @access Private
 */
exports.deleteUser = async (req, res, next) => {
  const correlationId = req.correlationId;
  
    try {
        await userService.deleteUser(req.params.id, correlationId);
        logger.info('User account deleted successfully', { correlationId, userId: req.params.id });

        return sendSuccess(res, { message: 'User account deleted successfully' });      
    } catch (error) {
        next(error);
    }
};