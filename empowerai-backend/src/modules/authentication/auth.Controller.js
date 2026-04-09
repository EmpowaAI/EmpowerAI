/**
 * Auth Controller
 * Responsibility: register, login, logout, validate token.
 * No business logic — fully delegates to userService.
 * DTOs are applied inside userService, not here.
 */

const logger = require('../../utils/logger');
const { sendSuccess } = require('../../utils/response');
const authService = require('./auth.Service');
const userService = require('../user/user.Service');

// ─────────────────────────────────────────────
// Register
// @route  POST /api/auth/register
// @access Public
// ─────────────────────────────────────────────
exports.register = async (req, res, next) => {

 /* //lock the registration for a short time to prevent abuse (e.g., 5 attempts per IP per hour)
  return res.status(503).json({
    success: false,
    message: "Registration is temporarily disabled due to maintenance. Try again later."
  }); */
  
  const correlationId = req.correlationId;
  try {
    const pending = await authService.register(req.body, correlationId);

    return sendSuccess(res, {
      message: 'Registration successful. Please check your email to verify your account.',
      user: pending, // { id, name, email } — safe subset, no token yet
    }, 201);
  } catch (error) {
    next(error);
  }
};



// ─────────────────────────────────────────────
// Login
// @route  POST /api/auth/login
// @access Public
// ─────────────────────────────────────────────
exports.login = async (req, res, next) => {
  const correlationId = req.correlationId;
  try {
    const { token, user } = await authService.login(req.body, correlationId);

    return sendSuccess(res, { token, user });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────
// Validate token
// @route  GET /api/auth/validate
// @access Private
// ─────────────────────────────────────────────
exports.validate = async (req, res, next) => {
  const correlationId = req.correlationId;
  try {
    // req.user is attached by auth middleware after token verification
    const user = await userService.getUserProfile(req.user.id, correlationId);

    logger.debug('Token validated successfully', { correlationId, userId: req.user.id });

    return sendSuccess(res, { user });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────
// Logout
// @route  POST /api/auth/logout
// @access Private
// ─────────────────────────────────────────────
exports.logout = async (req, res, next) => {
  const correlationId = req.correlationId;
  try {
    await userService.logout(req.user.id, correlationId);

    return sendSuccess(res, { message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
};
