/**
 * User Service
 * Handles:
 * - User profile retrieval
 * - User profile updates
 * - Account deletion
 * Used by UserController for profile management endpoints.
 * Note: This service focuses on user profile management and does not handle authentication, email verification, or password resets, which are responsibilities of AuthService and AccountService.
 */

const logger = require('../utils/logger');
const { NotFoundError } = require('../utils/errors');
const GetUserDto = require('../DTOs/User/GetUserDto');
const EditUserDto = require('../DTOs/User/EditUserDto');


class UserService {

  constructor(userRepository) {
    this.userRepository = userRepository;
  }


  //---------------------------------
  // Get User Profile
  //---------------------------------

  async getProfile(userId, correlationId = null) {
    logger.info(`Retrieving profile for user ID: ${userId}`, { correlationId });

    const user = await this.userRepository.findById(userId);
    if (!user) {
      logger.warn(`User not found with ID: ${userId}`, { correlationId });
      throw new NotFoundError('User not found');
    }

    logger.info(`Profile retrieved for user ID: ${userId}`, { correlationId });
    return new GetUserDto(user);
  }


  //---------------------------------
  // Update User Profile
  //---------------------------------

  async updateProfile(userId, dto, correlationId = null) {
    logger.info(`Updating profile for user ID: ${userId}`, { correlationId });

    const allowedFields = ['name', 'age', 'province', 'education', 'skills', 'interests'];
    const updateFields = {};
    allowedFields.forEach(field => {
      if (dto[field] !== undefined) updateFields[field] = dto[field];
    });

    const updatedUser = await this.userRepository.update(userId, updateFields);
    if (!updatedUser) {
      logger.warn(`User not found for update with ID: ${userId}`, { correlationId });
      throw new NotFoundError('User not found');
    }

    logger.info(`Profile updated for user ID: ${userId}`, { correlationId });
    return new GetUserDto(updatedUser);
  }


  //---------------------------------
  // Delete Account
  //---------------------------------

  async deleteAccount(userId, correlationId = null) {
    logger.info(`Deleting account for user ID: ${userId}`, { correlationId });

    const deletedUser = await this.userRepository.delete(userId);
    if (!deletedUser) {
      logger.warn(`User not found for deletion with ID: ${userId}`, { correlationId });
      throw new NotFoundError('User not found');
    }

    logger.info(`Account deleted for user ID: ${userId}`, { correlationId });
    return true;
  }

}

module.exports = UserService;