/**
 * Authentication Controller
 * Handles:
 * - User registration
 * - User login
 * - Token validation
 * - Token refresh
 * - Logout
 * Used by auth routes for authentication-related endpoints.
 * Note: This controller is focused on authentication flows and delegates business logic to AuthService. It does not handle user profile management or email verification, which are responsibilities of UserService and AccountService respectively.
 */

const logger = require('../utils/logger');
const { sendSuccess } = require('../utils/response');
const { UnauthorizedError } = require('../utils/errors');
const AuthService = require('../services/authService');
const UserRepository = require('../repositories/UserRepository');
const AccountService = require('../services/accountService');
const RegisterDto = require('../DTOs/Auth/RegisterDto');
const LoginDto = require('../DTOs/Auth/LoginDto');
const User = require('../models/User');

const userRepository = new UserRepository(User);
const accountService = new AccountService(userRepository);
const authService = new AuthService(userRepository, accountService);


/**
 * Register
 * @route POST /api/auth/register
 * @access Public
 */
exports.register = async (req, res, next) => {
  const correlationId = req.correlationId;
  const dto = new RegisterDto(req.body.name, req.body.email, req.body.password);

  try {
    logger.info(`Register attempt for email: ${dto.email}`, { correlationId });
    const newUser = await authService.register(dto, correlationId);
    logger.info(`User registered successfully: ${newUser.email}`, { correlationId, userId: newUser._id });
    return sendSuccess(res, {
      message: 'Registration successful. Please check your email to verify your account.'
    }, 201);
  } catch (error) {
    logger.error(`Registration failed for email: ${dto.email}`, { correlationId, error: error.message });
    next(error);
  }
};


/**
 * Login
 * @route POST /api/auth/login
 * @access Public
 */
exports.login = async (req, res, next) => {
  const correlationId = req.correlationId;
  const dto = new LoginDto(req.body.email, req.body.password);

  try {
    logger.info(`Login attempt for email: ${dto.email}`, { correlationId });
    const result = await authService.login(dto, correlationId);
    logger.info(`Login successful for email: ${dto.email}`, { correlationId, userId: result.userId });
    return sendSuccess(res, {
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      user: {
        id: result.userId,
        name: result.name,
        email: result.email,
      }
    });
  } catch (error) {
    logger.error(`Login failed for email: ${dto.email}`, { correlationId, error: error.message });
    next(error);
  }
};


/**
 * Refresh Token
 * @route POST /api/auth/refresh-token
 * @access Public
 */
exports.refreshToken = async (req, res, next) => {
  const correlationId = req.correlationId;
  const { refreshToken } = req.body;

  try {
    logger.info(`Token refresh requested`, { correlationId });
    const result = await authService.refreshToken(refreshToken, correlationId);
    logger.info(`Token refreshed successfully`, { correlationId });
    return sendSuccess(res, { accessToken: result.accessToken });
  } catch (error) {
    logger.error(`Token refresh failed`, { correlationId, error: error.message });
    next(error);
  }
};


/**
 * Logout
 * @route POST /api/auth/logout
 * @access Private
 */
exports.logout = async (req, res, next) => {
  const correlationId = req.correlationId;
  const { refreshToken } = req.body;

  try {
    logger.info(`Logout requested`, { correlationId });
    await authService.logout(refreshToken, correlationId);
    logger.info(`Logout successful`, { correlationId });
    return sendSuccess(res, { message: 'Logged out successfully' });
  } catch (error) {
    logger.error(`Logout failed`, { correlationId, error: error.message });
    next(error);
  }
};


/**
 * Validate Token
 * @route GET /api/auth/validate
 * @access Private
 */
exports.validate = async (req, res, next) => {
  const correlationId = req.correlationId;

  try {
    const user = req.user;
    logger.info(`Token validated for user: ${user.email}`, { correlationId, userId: user._id });
    return sendSuccess(res, {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      }
    });
  } catch (error) {
    logger.error(`Token validation failed`, { correlationId, error: error.message });
    next(error);
  }
};
