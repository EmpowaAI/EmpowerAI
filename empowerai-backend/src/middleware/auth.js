const jwt = require('jsonwebtoken');
const User = require('../modules/user/user.Model');
const mongoose = require('mongoose');
const logger = require('../utils/logger');

// ─── protect (your existing logic, unchanged) ────────────────────────────────
const protect = async (req, res, next) => {
  try {
    if (!process.env.JWT_SECRET) {
      logger.error('Auth: JWT_SECRET not configured');
      return res.status(500).json({ status: 'error', message: 'Server configuration error' });
    }

    logger.debug('Auth: checking authorization header', {
      hasAuthHeader: !!req.headers.authorization,
    });

    let token;
    if (req.headers.authorization?.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      logger.warn('Auth: no token provided');
      return res.status(401).json({ status: 'error', message: 'Please log in to access this resource' });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (jwtError) {
      if (jwtError.name === 'TokenExpiredError') {
        return res.status(401).json({ status: 'error', message: 'Your session has expired. Please log in again.' });
      }
      if (jwtError.name === 'JsonWebTokenError') {
        return res.status(401).json({ status: 'error', message: 'Invalid token. Please log in again.' });
      }
      throw jwtError;
    }

    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ status: 'error', message: 'Database is not connected. Please try again in a moment.' });
    }

    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return res.status(401).json({ status: 'error', message: 'User no longer exists' });
    }

    req.user = currentUser;
    next();
  } catch (error) {
    logger.error('Auth middleware error', { message: error.message });
    res.status(401).json({ status: 'error', message: 'Authentication failed. Please log in again.' });
  }
};

// ─── restrictTo: must come after protect in the chain ────────────────────────
const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ status: 'error', message: 'Not authenticated' });
    }

    if (!roles.includes(req.user.role)) {
      logger.warn('Auth: insufficient role', {
        userId: req.user._id,
        userRole: req.user.role,
        requiredRoles: roles,
      });
      return res.status(403).json({
        status: 'error',
        message: 'You do not have permission to perform this action',
      });
    }

    next();
  };
};

module.exports = { protect, restrictTo };