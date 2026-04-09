const jwt = require('jsonwebtoken');
const User = require('../modules/user/user.Model');
const mongoose = require('mongoose');
const logger = require('../utils/logger');

module.exports = async (req, res, next) => {
  try {
    // Check JWT_SECRET is configured
    if (!process.env.JWT_SECRET) {
      logger.error('Auth: JWT_SECRET not configured');
      return res.status(500).json({
        status: 'error',
        message: 'Server configuration error',
      });
    }

    logger.debug('Auth: checking authorization header', {
      hasAuthHeader: !!req.headers.authorization,
    });

    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      logger.warn('Auth: no token provided');
      return res.status(401).json({
        status: 'error',
        message: 'Please log in to access this resource',
      });
    }

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (jwtError) {
      if (jwtError.name === 'TokenExpiredError') {
        return res.status(401).json({
          status: 'error',
          message: 'Your session has expired. Please log in again.',
        });
      }
      if (jwtError.name === 'JsonWebTokenError') {
        return res.status(401).json({
          status: 'error',
          message: 'Invalid token. Please log in again.',
        });
      }
      throw jwtError;
    }

    // Check database connection
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        status: 'error',
        message: 'Database is not connected. Please try again in a moment.',
      });
    }

    // Check if user still exists
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return res.status(401).json({
        status: 'error',
        message: 'User no longer exists',
      });
    }

    // Grant access to protected route
    req.user = currentUser;
    next();
  } catch (error) {
    logger.error('Auth middleware error', { message: error.message });
    res.status(401).json({
      status: 'error',
      message: 'Authentication failed. Please log in again.',
    });
  }
};
