/**
 * User Repository
 * Single responsibility: all database read/write operations for User and PendingUser.
 * No business logic, no DTOs, no email sending — just DB access.
 *
 * Used by: UserService
 */

const User = require('../models/User');
const PendingUser = require('../models/PendingUser');
const mongoose = require('mongoose');
const logger = require('../utils/logger');

class UserRepository {

  // ─────────────────────────────────────────────
  // User — Read
  // ─────────────────────────────────────────────

  /**
   * Find a user by ID
   * @param {string} userId
   * @returns {Promise<object|null>}
   */
  async findById(userId) {
    if (!mongoose.Types.ObjectId.isValid(userId)) return null;
    return await User.findById(userId);
  }

  /**
   * Find a user by email
   * @param {string} email
   * @param {boolean} includePassword
   * @returns {Promise<object|null>}
   */
  async findByEmail(email, includePassword = false) {
    const query = User.findOne({ email: email.toLowerCase() });
    query.select(includePassword ? '+password' : '-password');
    return await query;
  }

  /**
   * Find a user by reset token (checks expiry)
   * @param {string} hashedToken
   * @returns {Promise<object|null>}
   */
  async findByResetToken(hashedToken) {
    return await User.findOne({
      resetToken:        hashedToken,
      resetTokenExpires: { $gt: Date.now() },
    });
  }

  /**
   * Find a user by email token (checks expiry)
   * Used for: email verification after change, email change confirmation
   * @param {string} hashedToken
   * @returns {Promise<object|null>}
   */
  async findByEmailToken(hashedToken) {
    return await User.findOne({
      emailToken:        hashedToken,
      emailTokenExpires: { $gt: Date.now() },
    });
  }

  /**
   * Find a user by delete token (checks expiry)
   * @param {string} hashedToken
   * @returns {Promise<object|null>}
   */
  async findByDeleteToken(hashedToken) {
    return await User.findOne({
      deleteToken:        hashedToken,
      deleteTokenExpires: { $gt: Date.now() },
    });
  }

  /**
   * Check if a verified user exists with this email
   * @param {string} email
   * @returns {Promise<boolean>}
   */
  async existsByEmail(email) {
    const user = await User.findOne({ email: email.toLowerCase() }).lean();
    return !!user;
  }

  // ─────────────────────────────────────────────
  // User — Write
  // ─────────────────────────────────────────────

  /**
   * Create a verified user (called after email verification)
   * @param {object} data - { name, email, password, isVerified }
   * @returns {Promise<object>} Created user document
   */
  async createUser(data) {
    return await User.create(data);
  }

  /**
   * Update allowed profile fields on a user
   * @param {string} userId
   * @param {object} fields - sanitized fields from UpdateUserDTO
   * @returns {Promise<object|null>} Updated user document
   */
  async updateUser(userId, fields) {
    return await User.findByIdAndUpdate(
      userId,
      { $set: fields },
      { new: true, runValidators: true }
    );
  }

  /**
   * Save a user document directly (used after mutating fields like tokens or password)
   * @param {object} user - Mongoose User document
   * @returns {Promise<object>} Saved user document
   */
  async saveUser(user) {
    return await user.save();
  }

  /**
   * Delete a user by ID
   * @param {string} userId
   * @returns {Promise<void>}
   */
  async deleteUser(userId) {
    await User.findByIdAndDelete(userId);
  }

  // ─────────────────────────────────────────────
  // PendingUser — Read
  // ─────────────────────────────────────────────

  /**
   * Find a pending user by email token (checks expiry)
   * @param {string} hashedToken
   * @returns {Promise<object|null>}
   */
  async findPendingByEmailToken(hashedToken) {
    return await PendingUser.findOne({
      emailToken:        hashedToken,
      emailTokenExpires: { $gt: Date.now() },
    }).select('+password');
  }

  /**
   * Find a pending user by email
   * @param {string} email
   * @returns {Promise<object|null>}
   */
  async findPendingByEmail(email) {
    return await PendingUser.findOne({ email: email.toLowerCase() });
  }

  /**
   * Check if a pending registration exists with this email
   * @param {string} email
   * @returns {Promise<boolean>}
   */
  async pendingExistsByEmail(email) {
    const pending = await PendingUser.findOne({ email: email.toLowerCase() }).lean();
    return !!pending;
  }

  // ─────────────────────────────────────────────
  // PendingUser — Write
  // ─────────────────────────────────────────────

  /**
   * Create a pending user (called on registration before email verification)
   * @param {object} data - { name, email, password, emailToken, emailTokenExpires }
   * @returns {Promise<object>} Created PendingUser document
   */
  async createPendingUser(data) {
    return await PendingUser.create(data);
  }

  /**
   * Delete a pending user by ID (called after successful verification)
   * @param {string} pendingId
   * @returns {Promise<void>}
   */
  async deletePendingUser(pendingId) {
    await PendingUser.findByIdAndDelete(pendingId);
  }

}

module.exports = new UserRepository();
