/**
 * Authentication Controller
 * Principal Engineer Level: Clean separation of concerns with proper error handling
 */

const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');
const { sendSuccess } = require('../utils/response');
const { 
  UnauthorizedError, 
} = require('../utils/errors');
const userService = require('../services/userService');

/**
 * Sign JWT token
 * @param {string} id - User ID
 * @returns {string} JWT token
 */
const signToken = (id) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not configured');
  }
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

/**
 * Register new user
 * @route POST /api/auth/register
 * @access Public
 */
exports.register = async (req, res, next) => {
  const correlationId = req.correlationId;
  
  try {
    // Use service layer to create user
    const newUser = await userService.createUser(req.body, correlationId);

    // Generate token
    const token = signToken(newUser._id);

    // Return success response with token
    return sendSuccess(res, {
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        province: newUser.province,
        age: newUser.age,
      }
    }, 201);
  } catch (error) {
    // Errors are handled by global error handler
    next(error);
  }
};

/**
 * Login user
 * @route POST /api/auth/login
 * @access Public
 */
exports.login = async (req, res, next) => {
  const correlationId = req.correlationId;
  
  try {
    const { email, password } = req.body;

    // Find user with password included
    const user = await userService.findByEmail(email, correlationId, true);
    
    if (!user) {
      logger.warn('Login attempt with non-existent email', { correlationId, email });
      throw new UnauthorizedError('Incorrect email or password');
    }

     // Check if email is verified
    if (!user.isVerified) {
      logger.warn('Login attempt with unverified email', { correlationId, email, userId: user._id });
      throw new UnauthorizedError('Email is not verified. Please verify your email first.');
    }

    // Verify password
    const isPasswordCorrect = await user.correctPassword(password);
    if (!isPasswordCorrect) {
      logger.warn('Login attempt with incorrect password', { correlationId, email, userId: user._id });
      throw new UnauthorizedError('Incorrect email or password');
    }

    // Generate token
    const token = signToken(user._id);

    logger.info('User logged in successfully', {
      correlationId,
      userId: user._id,
      email: user.email,
    });

    // Return success response with token
    return sendSuccess(res, {
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        province: user.province,
        age: user.age,
        empowermentScore: user.empowermentScore,
      }
    });
  } catch (error) {
    // Errors are handled by global error handler
    next(error);
  }
};

/**
 * Validate token
 * @route GET /api/auth/validate
 * @access Private
 */
exports.validate = async (req, res, next) => {
  const correlationId = req.correlationId;
  
  try {
    // User is already attached to req by auth middleware
    const user = req.user;

    logger.debug('Token validated successfully', {
      correlationId,
      userId: user.id,
    });

    return sendSuccess(res, {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        province: user.province,
      }
    });
  } catch (error) {
    next(error);
  }
};
