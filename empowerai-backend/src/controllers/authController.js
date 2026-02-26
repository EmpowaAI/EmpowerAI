/**
 * Authentication Controller
 * Handles:
 * - User registration
 * - User login
 * - Token validation
 * - Token refresh
 * - Logout
 */

const logger = require('../utils/logger');
const { sendSuccess } = require('../utils/response');

const AuthService = require('../services/authService');
const UserRepository = require('../repositories/UserRepository');
const AccountService = require('../services/accountService');

const RegisterDto = require('../DTOs/Auth/RegisterDto');
const LoginDto = require('../DTOs/Auth/LoginDto');

const User = require('../models/User');

// Dependency Injection
const userRepository = new UserRepository(User);
const accountService = new AccountService(userRepository);
const authService = new AuthService(userRepository, accountService);


/**
 * Register
 * POST /api/auth/register
 * Public
 */
exports.register = async (req, res, next) => {
  const correlationId = req.correlationId;

  const dto = new RegisterDto(
    req.body.name,
    req.body.email,
    req.body.password
  );

  try {
    logger.info('Register attempt', { correlationId, email: dto.email });

    await authService.register(dto, correlationId);

    return sendSuccess(res, {
      message: 'Registration successful. Check your email to verify your account.',
    }, 201);

  } catch (error) {
    logger.error('Registration failed', { correlationId, error: error.message });
    next(error);
  }
};


/**
 * Login
 * POST /api/auth/login
 * Public
 */
exports.login = async (req, res, next) => {
  const correlationId = req.correlationId;

  const dto = new LoginDto(
    req.body.email,
    req.body.password
  );

  try {
    logger.info('Login attempt', { correlationId, email: dto.email });

    const result = await authService.login(dto, correlationId);

    return sendSuccess(res, {
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      user: {
        id: result.userId,
        name: result.name,
        email: result.email,
      },
    });

  } catch (error) {
    logger.error('Login failed', { correlationId, error: error.message });
    next(error);
  }
};


/**
 * Refresh Token
 * POST /api/auth/refresh-token
 * Public
 */
exports.refreshToken = async (req, res, next) => {
  const correlationId = req.correlationId;
  const { refreshToken } = req.body;

  try {
    logger.info('Refresh token request', { correlationId });

    const result = await authService.refreshToken(refreshToken, correlationId);

    return sendSuccess(res, {
      accessToken: result.accessToken,
    });

  } catch (error) {
    logger.error('Refresh token failed', { correlationId, error: error.message });
    next(error);
  }
};


/**
 * Logout
 * POST /api/auth/logout
 * Private
 */
exports.logout = async (req, res, next) => {
  const correlationId = req.correlationId;
  const { refreshToken } = req.body;

  try {
    await authService.logout(refreshToken, correlationId);

    logger.info('Logout success', { correlationId, userId: req.user._id });

    return sendSuccess(res, {
      message: 'Logged out successfully',
    });

  } catch (error) {
    logger.error('Logout failed', { correlationId, error: error.message });
    next(error);
  }
};


/**
 * Validate Token
 * GET /api/auth/validate
 * Private
 */
exports.validate = async (req, res, next) => {
  const correlationId = req.correlationId;

  try {
    const user = req.user;

    logger.info('Token valid', { correlationId, userId: user._id });

    return sendSuccess(res, {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });

  } catch (error) {
    logger.error('Validation failed', { correlationId, error: error.message });
    next(error);
  }
};
