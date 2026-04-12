

const logger      = require('../../utils/logger');
const { sendSuccess } = require('../../utils/response');
const authService = require('./auth.Service');
const userService = require('../user/user.Service');

const getClientIp = (req) =>
  (req.headers['x-forwarded-for'] || '').split(',')[0].trim() ||
  req.socket?.remoteAddress ||
  null;

// ─── Register ─────────────────────────────────────────────────────────────────
exports.register = async (req, res, next) => {
  const correlationId = req.correlationId;
  try {
  
    const clientIp = getClientIp(req);
    const pending  = await authService.register(req.body, correlationId, clientIp);

    return sendSuccess(res, {
      message: 'Registration successful. Please check your email to verify your account.',
      user: pending, 
    }, 201);
  } catch (error) {
    next(error);
  }
};

// ─── Login ────────────────────────────────────────────────────────────────────
exports.login = async (req, res, next) => {
  const correlationId = req.correlationId;
  try {
    const { token, user } = await authService.login(req.body, correlationId);
    return sendSuccess(res, { token, user });
  } catch (error) {
    next(error);
  }
};

// ─── Validate token ───────────────────────────────────────────────────────────
exports.validate = async (req, res, next) => {
  const correlationId = req.correlationId;
  try {
    const user = await userService.getUserProfile(req.user.id, correlationId);
    logger.debug('Token validated successfully', { correlationId, userId: req.user.id });
    return sendSuccess(res, { user });
  } catch (error) {
    next(error);
  }
};

// ─── Logout ───────────────────────────────────────────────────────────────────
exports.logout = async (req, res, next) => {
  const correlationId = req.correlationId;
  try {
    await userService.logout(req.user.id, correlationId);
    return sendSuccess(res, { message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
};
