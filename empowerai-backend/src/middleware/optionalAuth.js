const jwt = require('jsonwebtoken');
const User = require('../models/User');
const mongoose = require('mongoose');

/**
 * Optional auth middleware.
 * If a valid Bearer token is provided, attaches req.user.
 * If no token is provided, continues as unauthenticated.
 * If token is provided but invalid/expired, returns 401.
 */
module.exports = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next();
    }

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({
        status: 'error',
        message: 'Server configuration error'
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
          message: 'Your session has expired. Please log in again.'
        });
      } else if (jwtError.name === 'JsonWebTokenError') {
        return res.status(401).json({
          status: 'error',
          message: 'Invalid token. Please log in again.'
        });
      }
      throw jwtError;
    }

    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        status: 'error',
        message: 'Database is not connected. Please try again in a moment.'
      });
    }

    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return res.status(401).json({
        status: 'error',
        message: 'User no longer exists'
      });
    }

    req.user = currentUser;
    next();
  } catch (error) {
    console.error('Optional auth middleware error:', error.message);
    res.status(401).json({
      status: 'error',
      message: 'Authentication failed. Please log in again.'
    });
  }
};
