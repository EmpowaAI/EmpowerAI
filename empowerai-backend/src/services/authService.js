/**
 * Authentication Service
 * Handles:
 * - User registration
 * - User login
 * - JWT token generation
 * - Refresh token handling
 * - Logout
 *
 * It uses the UserRepository for database interactions
 * and the AccountService for sending verification emails.
 */

const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const logger = require('../utils/logger');
const { NotFoundError, ConflictError } = require('../utils/errors');
const AuthResponseDto = require('../DTOs/Auth/AuthResponseDto');
const PendingUser = require('../models/PendingUser');
const User = require('../models/User');


class AuthService {

  constructor(userRepository, accountService) {
    this.userRepository = userRepository;
    this.accountService = accountService;
  }


  //---------------------------------
  // Registration
  //---------------------------------

  async register(dto, correlationId = null) {
    logger.info(`Register attempt for email: ${dto.email}`, { correlationId });

    // 1️⃣ Check if user already exists in real users
    const existingUser = await User.findOne({ email: dto.email });
    if (existingUser) {
      logger.warn(`Email already in use: ${dto.email}`, { correlationId });
      throw new Error('Email already in use');
    }

    // 2️⃣ Check if pending user exists
    const existingPending = await PendingUser.findOne({ email: dto.email });
    if (existingPending) {
      logger.warn(`Pending registration already exists: ${dto.email}`, { correlationId });
      throw new Error('A verification email has already been sent to this email.');
    }

    // 3️⃣ Generate email verification token
    const emailToken = crypto.randomBytes(32).toString('hex');
    const emailTokenHash = crypto.createHash('sha256').update(emailToken).digest('hex');
    const emailTokenExpires = Date.now() + 60 * 60 * 1000; // 1 hour

    // 4️⃣ Save plain password — User model's pre('save') hook will hash it on verification
    const pendingUser = await PendingUser.create({
      name: dto.name,
      email: dto.email,
      password: dto.password,
      emailToken: emailTokenHash,
      emailTokenExpires,
    });

    // 5️⃣ Send verification email
    try {
      await this.accountService.sendVerificationEmail(dto.email, emailToken, correlationId);
      logger.info(`Verification email sent to: ${dto.email}`, { correlationId });
    } catch (err) {
      logger.error(`Failed to send verification email: ${dto.email}`, { correlationId, error: err.message });
      // Clean up pending user if email fails
      await PendingUser.deleteOne({ _id: pendingUser._id });
      throw new Error('Unable to send verification email. Please try again later.');
    }

    return { message: 'Registration pending. Please check your email to verify your account.' };
  }


  //---------------------------------
  // Login
  //---------------------------------

  async login(dto, correlationId = null) {
    logger.info(`Attempting login for email: ${dto.email}`, { correlationId });

    // Check if user is pending verification first
    const pendingUser = await PendingUser.findOne({ email: dto.email });
    if (pendingUser) {
      logger.warn(`User email not verified: ${dto.email}`, { correlationId });
      throw new ConflictError('Please verify your email before logging in');
    }

    // Now look for a fully verified user
    const user = await this.userRepository.findByEmailWithPassword(dto.email);
    if (!user) {
      logger.warn(`No user found with email: ${dto.email}`, { correlationId });
      throw new NotFoundError('Invalid email or password');
    }

    const isMatch = await user.correctPassword(dto.password);
    if (!isMatch) {
      logger.warn(`Invalid password for email: ${dto.email}`, { correlationId });
      throw new NotFoundError('Invalid email or password');
    }

    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user);
    const refreshTokenExpires = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 days

    await this.userRepository.updateRefreshToken(user._id, refreshToken, refreshTokenExpires);

    logger.info(`Login successful for email: ${dto.email}`, { correlationId, userId: user._id });

    return new AuthResponseDto(user._id, user.name, user.email, accessToken, refreshToken);
  }


  //---------------------------------
  // Refresh Token
  //---------------------------------

  async refreshToken(refreshToken, correlationId = null) {
    logger.info(`Refreshing access token`, { correlationId });

    const user = await this.userRepository.findByRefreshToken(refreshToken);
    if (!user || user.refreshTokenExpires < Date.now()) {
      logger.warn(`Invalid or expired refresh token`, { correlationId });
      throw new NotFoundError('Invalid or expired refresh token');
    }

    const accessToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '15m' });

    logger.info(`Access token refreshed for user: ${user.email}`, { correlationId, userId: user._id });

    return { accessToken };
  }


  //---------------------------------
  // Logout
  //---------------------------------

  async logout(refreshToken, correlationId = null) {
    logger.info(`Logging out`, { correlationId });

    const user = await this.userRepository.findByRefreshToken(refreshToken);
    if (!user) {
      logger.warn(`No user found with provided refresh token`, { correlationId });
      return true;
    }

    await this.userRepository.invalidateRefreshToken(user._id);

    logger.info(`Logout successful for user: ${user.email}`, { correlationId, userId: user._id });

    return true;
  }


  //---------------------------------
  // Token Helpers
  //---------------------------------

  generateAccessToken(user) {
    return jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '15m' });
  }

  generateRefreshToken(user) {
    return jwt.sign({ id: user._id }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
  }

}

module.exports = AuthService;
