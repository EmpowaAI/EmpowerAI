/**
 * User Service
 * Principal Engineer Level: Business logic separated from controllers
 *
 * Covers:
 *   register, verifyEmail, login, logout,
 *   forgotPassword, resetPassword, changePassword,
 *   getUserProfile, updateUser,
 *   requestEmailChange, confirmEmailChange,
 *   requestAccountDeletion, confirmAccountDeletion
 */

const User = require('../models/User');
const PendingUser = require('../models/PendingUser');
const mongoose = require('mongoose');
const logger = require('../utils/logger');
const { NotFoundError, ConflictError, UnauthorizedError, ServiceUnavailableError } = require('../utils/errors');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const emailService = require('./emailService');

// DTOs
const { toRegisterDTO }       = require('../dtos/Authentication/RegisterDto');
const { toLoginDTO }          = require('../dtos/Authentication/LoginDto');
const { toForgotPasswordDTO }  = require('../dtos/Authentication/ForgotPasswordDto');
const { toResetPasswordDTO }   = require('../dtos/Authentication/ResetPasswordDto');
const { toGetUserDTO }        = require('../dtos/User/GetUserDto');
const { toUpdateUserDTO }     = require('../dtos/User/UpdateUserDto');
const { toUpdateEmailDTO }    = require('../dtos/User/UpdateEmailDto');
const { toChangePasswordDTO } = require('../dtos/User/ChangePasswordDto');

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────
const signToken = (id) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not configured');
  }
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};


class UserService {

  // ─────────────────────────────────────────────
  // Internal lookups (not exposed to controllers)
  // ─────────────────────────────────────────────

  /**
   * Find raw User document by ID — internal use only.
   * Controllers receive DTOs, not raw documents.
   * @param {string} userId
   * @param {string} correlationId
   * @returns {Promise<object>} Raw User document
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
   * Find raw User document by email — internal use only.
   * @param {string} email
   * @param {string} correlationId
   * @param {boolean} includePassword
   * @returns {Promise<object|null>}
   */
  async findByEmail(email, correlationId = null, includePassword = false) {
    const query = User.findOne({ email: email.toLowerCase() });

    if (includePassword) {
      query.select('+password');
    } else {
      query.select('-password');
    }

    return await query;
  }

  /**
   * Check if email is taken in either User or PendingUser
   * @param {string} email
   * @returns {Promise<boolean>}
   */
  async userExists(email) {
    const normalized = email.toLowerCase();
    const [user, pending] = await Promise.all([
      User.findOne({ email: normalized }),
      PendingUser.findOne({ email: normalized }),
    ]);
    return !!(user || pending);
  }

  // ─────────────────────────────────────────────
  // Auth — Register & Verify
  // ─────────────────────────────────────────────

  /**
   * Register — saves to PendingUser and sends verification email.
   * Real User is NOT created until email is verified.
   * Uses RegisterDTO: { name, email, password }
   * @param {object} rawData - req.body
   * @param {string} correlationId
   * @returns {Promise<object>} { id, name, email }
   */
  async register(rawData, correlationId = null) {
    if (mongoose.connection.readyState !== 1) {
      throw new ServiceUnavailableError('Database is not connected', 'mongodb');
    }

    const dto = toRegisterDTO(rawData);

    const exists = await this.userExists(dto.email);
    if (exists) {
      logger.warn('Registration attempted with existing email', { correlationId, email: dto.email });
      throw new ConflictError('User already exists with this email');
    }

    const rawToken = crypto.randomBytes(32).toString('hex');
    const emailToken = crypto.createHash('sha256').update(rawToken).digest('hex');

    const pending = await PendingUser.create({
      name:              dto.name,
      email:             dto.email.toLowerCase(),
      password:          dto.password,
      emailToken,
      emailTokenExpires: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
    });

    await emailService.sendVerification(pending.email, rawToken);

    logger.info('Pending user created - verification email sent', {
      correlationId,
      pendingId: pending._id,
      email:     pending.email,
    });

    return { id: pending._id, name: pending.name, email: pending.email };
  }

  /**
   * Verify email — promotes PendingUser to User.
   * Only name, email and password are carried over.
   * Profile fields are populated later during twin creation.
   * @param {string} rawToken - token from email link
   * @param {string} correlationId
   * @returns {Promise<object>} GetUserDTO
   */
  async verifyEmail(rawToken, correlationId = null) {
    const token = crypto.createHash('sha256').update(rawToken).digest('hex');

    const pending = await PendingUser.findOne({
      emailToken:        token,
      emailTokenExpires: { $gt: Date.now() },
    }).select('+password');

    if (!pending) {
      throw new NotFoundError('Invalid or expired verification token');
    }

    // Edge case: double-click on verify link
    const alreadyVerified = await User.findOne({ email: pending.email });
    if (alreadyVerified) {
      await PendingUser.findByIdAndDelete(pending._id);
      logger.warn('Duplicate verification attempt', { correlationId, email: pending.email });
      return toGetUserDTO(alreadyVerified);
    }


    const user = new User({
      name:       pending.name,
      email:      pending.email,
      password:   pending.password, // already hashed by PendingUser pre-save hook
      isVerified: true,
    });
    user.$locals.skipHash = true; // prevent double-hashing
    await user.save();

    await PendingUser.findByIdAndDelete(pending._id);

    logger.info('Email verified - user promoted from pending', {
      correlationId,
      userId: user._id,
      email:  user.email,
    });

    return toGetUserDTO(user);
  }

  // ─────────────────────────────────────────────
  // Auth — Login & Logout
  // ─────────────────────────────────────────────

  /**
   * Login — validates credentials and returns a signed JWT + user DTO.
   * Uses LoginDTO: { email, password }
   * @param {object} rawData - req.body
   * @param {string} correlationId
   * @returns {Promise<{ token: string, user: object }>}
   */
  async login(rawData, correlationId = null) {
    const startTime = Date.now();
    const dto = toLoginDTO(rawData);

    const user = await User.findOne({ email: dto.email.toLowerCase() }).select('+password');
    if (!user) {
      logger.warn('Login attempt with non-existent email', { correlationId, email: dto.email });
      throw new UnauthorizedError('Incorrect email or password');
    }

    if (!user.isVerified) {
      logger.warn('Login attempt by unverified user', { correlationId, userId: user._id });
      throw new UnauthorizedError('Please verify your email before logging in');
    }

    const isPasswordCorrect = await user.correctPassword(dto.password);
    if (!isPasswordCorrect) {
      logger.warn('Login attempt with incorrect password', { correlationId, userId: user._id });
      throw new UnauthorizedError('Incorrect email or password');
    }

    const token = signToken(user._id);

    logger.info('User logged in successfully', {
      correlationId,
      userId:   user._id,
      email:    user.email,
      duration: `${Date.now() - startTime}ms`,
    });

    return { token, user: toGetUserDTO(user) };
  }

  /**
   * Logout — JWT is stateless so the client discards the token.
   * This method exists as a hook for future token blacklisting
   * or refresh token invalidation.
   * @param {string} userId
   * @param {string} correlationId
   */
  async logout(userId, correlationId = null) {
    // Stateless logout — no DB action needed for plain JWT.
    // If you add refresh tokens or a token blacklist, invalidate here.
    logger.info('User logged out', { correlationId, userId });
  }

  // ─────────────────────────────────────────────
  // Password
  // ─────────────────────────────────────────────

  /**
   * Forgot password — sends a reset email.
   * Silent if email is not found (don't reveal account existence).
   * @param {string} email
   * @param {string} correlationId
   */
  async forgotPassword(rawData, correlationId = null) {
    const dto = toForgotPasswordDTO(rawData);
    const email = dto.email;
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return; // silent

    const raw = crypto.randomBytes(32).toString('hex');
    const token = crypto.createHash('sha256').update(raw).digest('hex');

    user.resetToken = token;
    user.resetTokenExpires = Date.now() + 30 * 60 * 1000; // 30 minutes
    await user.save();

    await emailService.sendReset(user.email, raw);

    logger.info('Password reset email sent', { correlationId, userId: user._id });
  }

  /**
   * Reset password — validates token from email and sets new password.
   * Uses ResetPasswordDTO: { token, newPassword }
   * @param {object} dto - toResetPasswordDTO(req.body)
   * @param {string} correlationId
   */
  async resetPassword(rawData, correlationId = null) {
    const dto = toResetPasswordDTO(rawData);
    const hashed = crypto.createHash('sha256').update(dto.token).digest('hex');

    const user = await User.findOne({
      resetToken:        hashed,
      resetTokenExpires: { $gt: Date.now() },
    });

    if (!user) {
      throw new NotFoundError('Invalid or expired token');
    }

    user.password = dto.newPassword; // model handles hashing
    user.resetToken = null;
    user.resetTokenExpires = null;
    await user.save();

    logger.info('Password reset successful', { correlationId, userId: user._id });
  }

  /**
   * Change password — requires current password to confirm identity.
   * Uses ChangePasswordDTO: { currentPassword, newPassword }
   * @param {string} userId
   * @param {object} rawData - req.body
   * @param {string} correlationId
   */
  async changePassword(userId, rawData, correlationId = null) {
    const dto = toChangePasswordDTO(rawData);

    const user = await User.findById(userId).select('+password');
    if (!user) throw new NotFoundError('User not found');

    const isCorrect = await user.correctPassword(dto.currentPassword, user.password);
    if (!isCorrect) throw new UnauthorizedError('Current password is incorrect');

    user.password = dto.newPassword;
    await user.save();

    logger.info('User password changed successfully', { correlationId, userId });
  }

  // ─────────────────────────────────────────────
  // Profile
  // ─────────────────────────────────────────────

  /**
   * Get user profile — returns a sanitized GetUserDTO.
   * @param {string} userId
   * @param {string} correlationId
   * @returns {Promise<object>} GetUserDTO
   */
  async getUserProfile(userId, correlationId = null) {
    const user = await this.findById(userId, correlationId);
    return toGetUserDTO(user);
  }

  /**
   * Update user profile — blocks email and password changes.
   * Uses UpdateUserDTO: { name, age, province, education, skills, interests, avatar }
   * @param {string} userId
   * @param {object} rawData - req.body
   * @param {string} correlationId
   * @returns {Promise<object>} GetUserDTO
   */
  async updateUser(userId, rawData, correlationId = null) {
    await this.findById(userId, correlationId);

    const dto = toUpdateUserDTO(rawData);

    if (Object.keys(dto).length === 0) {
      throw new Error('No valid fields provided to update');
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: dto },
      { new: true, runValidators: true }
    );

    logger.info('User updated successfully', {
      correlationId,
      userId,
      updatedFields: Object.keys(dto),
    });

    return toGetUserDTO(updatedUser);
  }

  // ─────────────────────────────────────────────
  // Email Change (two-step: request → confirm)
  // ─────────────────────────────────────────────

  /**
   * Step 1: Request email change.
   * Requires current password to confirm identity.
   * Sends a verification email to the NEW address.
   * Email is NOT changed yet.
   * Uses UpdateEmailDTO: { newEmail, password }
   * @param {string} userId
   * @param {object} rawData - req.body
   * @param {string} correlationId
   */
  async requestEmailChange(userId, rawData, correlationId = null) {
    const dto = toUpdateEmailDTO(rawData);

    const user = await User.findById(userId).select('+password');
    if (!user) throw new NotFoundError('User not found');

    const isCorrect = await user.correctPassword(dto.password, user.password);
    if (!isCorrect) throw new UnauthorizedError('Incorrect password');

    const taken = await this.userExists(dto.newEmail);
    if (taken) throw new ConflictError('This email address is already in use');

    const rawToken = crypto.randomBytes(32).toString('hex');
    const emailToken = crypto.createHash('sha256').update(rawToken).digest('hex');

    user.pendingEmail = dto.newEmail;
    user.emailToken = emailToken;
    user.emailTokenExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save();

    await emailService.sendEmailChange(dto.newEmail, rawToken);

    logger.info('Email change requested - verification sent to new address', {
      correlationId,
      userId,
      newEmail: dto.newEmail,
    });
  }

  /**
   * Step 2: Confirm email change.
   * Validates token from verification email and applies the new email.
   * @param {string} rawToken
   * @param {string} correlationId
   * @returns {Promise<object>} GetUserDTO
   */
  async confirmEmailChange(rawToken, correlationId = null) {
    const token = crypto.createHash('sha256').update(rawToken).digest('hex');

    const user = await User.findOne({
      emailToken:        token,
      emailTokenExpires: { $gt: Date.now() },
    });

    if (!user || !user.pendingEmail) {
      throw new NotFoundError('Invalid or expired email change token');
    }

    user.email = user.pendingEmail;
    user.pendingEmail = null;
    user.emailToken = null;
    user.emailTokenExpires = null;
    await user.save();

    logger.info('Email changed successfully', {
      correlationId,
      userId:   user._id,
      newEmail: user.email,
    });

    return toGetUserDTO(user);
  }

  // ─────────────────────────────────────────────
  // Account Deletion (two-step: request → confirm)
  // ─────────────────────────────────────────────

  /**
   * Step 1: Request account deletion.
   * Sends a confirmation email. Account is NOT deleted yet.
   * @param {string} userId
   * @param {string} correlationId
   */
  async requestAccountDeletion(userId, correlationId = null) {
    const user = await this.findById(userId, correlationId);

    const rawToken = crypto.randomBytes(32).toString('hex');
    const deleteToken = crypto.createHash('sha256').update(rawToken).digest('hex');

    user.deleteToken = deleteToken;
    user.deleteTokenExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
    await user.save();

    await emailService.sendAccountDeletion(user.email, rawToken);

    logger.info('Account deletion requested - confirmation email sent', {
      correlationId,
      userId,
    });
  }

  /**
   * Step 2: Confirm account deletion.
   * Validates token and permanently deletes the account.
   * @param {string} rawToken
   * @param {string} correlationId
   */
  async confirmAccountDeletion(rawToken, correlationId = null) {
    const hashed = crypto.createHash('sha256').update(rawToken).digest('hex');

    const user = await User.findOne({
      deleteToken:        hashed,
      deleteTokenExpires: { $gt: Date.now() },
    });

    if (!user) {
      throw new NotFoundError('Invalid or expired deletion token');
    }

    const userId = user._id;
    await User.findByIdAndDelete(userId);

    logger.info('User account permanently deleted', { correlationId, userId });
  }

}

module.exports = new UserService();
