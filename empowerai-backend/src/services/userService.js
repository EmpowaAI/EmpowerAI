/**
 * User Service
 * Principal Engineer Level: Business logic separated from controllers
 */

const User = require('../models/User');
const mongoose = require('mongoose');
const logger = require('../utils/logger');
const { NotFoundError, ConflictError, ServiceUnavailableError } = require('../utils/errors');
const crypto = require("crypto");
const emailService = require("./emailService");


class UserService {
  /**
   * Find user by ID
   * @param {string} userId - User ID
   * @param {string} correlationId - Request correlation ID
   * @returns {Promise<object>} User object
   */
  async findById(userId, correlationId = null) {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new NotFoundError('User not found');
    }

    const user = await User.findById(userId);
    
    if (!user) {
      logger.warn('User not found', { correlationId, userId });
      throw new NotFoundError('User not found');
    }

    return user;
  }

  /**
   * Find user by email
   * @param {string} email - User email
   * @param {string} correlationId - Request correlation ID
   * @param {boolean} includePassword - Include password in result
   * @returns {Promise<object|null>} User object or null
   */
  async findByEmail(email, correlationId = null, includePassword = false) {
    const query = User.findOne({ email: email.toLowerCase() });
    
    if (includePassword) {
      query.select('+password');
    }

    return await query;
  }

  /**
   * Check if user exists
   * @param {string} email - User email
   * @returns {Promise<boolean>} True if user exists
   */
  async userExists(email) {
    const user = await User.findOne({ email: email.toLowerCase() });
    return !!user;
  }

  /**
   * Create new user
   * @param {object} userData - User data
   * @param {string} correlationId - Request correlation ID
   * @returns {Promise<object>} Created user
   */
  async createUser(userData, correlationId = null) {
  if (mongoose.connection.readyState !== 1) {
    throw new ServiceUnavailableError('Database is not connected', 'mongodb');
  }

  const exists = await this.userExists(userData.email);
  if (exists) {
    logger.warn('User creation attempted with existing email', { correlationId, email: userData.email });
    throw new ConflictError('User already exists with this email');
  }

  // Generate email token
  const rawToken = crypto.randomBytes(32).toString("hex");
  const emailToken = crypto.createHash("sha256").update(rawToken).digest("hex");

  const user = await User.create({
    name: userData.name,
    email: userData.email.toLowerCase(),
    password: userData.password,
    age: userData.age,
    province: userData.province,
    education: userData.education,
    skills: userData.skills || [],
    interests: userData.interests || [],
    isVerified: false,
    emailToken,
    emailTokenExpires: Date.now() + 60 * 60 * 1000 // 1 hour
  });

  await emailService.sendVerification(user.email, rawToken);

  logger.info('User created (pending verification)', {
    correlationId,
    userId: user._id,
    email: user.email,
  });

  return user;
}

async verifyEmail(rawToken, correlationId = null) {
  const token = crypto.createHash("sha256").update(rawToken).digest("hex");

  const user = await User.findOne({
    emailToken: token,
    emailTokenExpires: { $gt: Date.now() }
  });

  if (!user) {
    throw new NotFoundError("Invalid or expired token");
  }

  user.isVerified = true;
  user.emailToken = null;
  user.emailTokenExpires = null;
  await user.save();

  logger.info("Email verified", { correlationId, userId: user._id });
}

async forgotPassword(email, correlationId = null) {
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) return; // silent

  const raw = crypto.randomBytes(32).toString("hex");
  const token = crypto.createHash("sha256").update(raw).digest("hex");

  user.resetToken = token;
  user.resetTokenExpires = Date.now() + 30 * 60 * 1000;
  await user.save();

  await emailService.sendReset(user.email, raw);

  logger.info("Password reset email sent", { correlationId, userId: user._id });
}

async resetPassword({ token, newPassword }) {
  const hashed = crypto.createHash("sha256").update(token).digest("hex");

  const user = await User.findOne({
    resetToken: hashed,
    resetTokenExpires: { $gt: Date.now() }
  });

  if (!user) {
    throw new NotFoundError("Invalid or expired token");
  }

  user.password = newPassword; // your model should hash
  user.resetToken = null;
  user.resetTokenExpires = null;
  await user.save();

  logger.info("Password reset successful", { userId: user._id });
}


  /**
   * Update user
   * @param {string} userId - User ID
   * @param {object} updateData - Data to update
   * @param {string} correlationId - Request correlation ID
   * @returns {Promise<object>} Updated user
   */
  async updateUser(userId, updateData, correlationId = null) {
    const user = await this.findById(userId, correlationId);

    // Remove fields that shouldn't be updated directly
    const { password, email, ...allowedUpdates } = updateData;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: allowedUpdates },
      { new: true, runValidators: true }
    );

    logger.info('User updated successfully', {
      correlationId,
      userId,
      updatedFields: Object.keys(allowedUpdates),
    });

    return updatedUser;
  }

  /**
   * Get user profile (sanitized)
   * @param {string} userId - User ID
   * @param {string} correlationId - Request correlation ID
   * @returns {Promise<object>} User profile
   */
  async getUserProfile(userId, correlationId = null) {
    const user = await this.findById(userId, correlationId);

    return {
      id: user._id,
      name: user.name,
      email: user.email,
      age: user.age,
      province: user.province,
      education: user.education,
      skills: user.skills || [],
      interests: user.interests || [],
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}

module.exports = new UserService();

