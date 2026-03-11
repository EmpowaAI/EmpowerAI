const jwt = require('jsonwebtoken');
const User = require('../models/User');
const mongoose = require('mongoose');

module.exports = async (req, res, next) => {
  try {
    // Check JWT_SECRET is configured
    if (!process.env.JWT_SECRET) {
      console.error('🔐 AUTH: JWT_SECRET not configured!');
      return res.status(500).json({
        status: 'error',
        message: 'Server configuration error'
      });
    }

    console.log('🔐 AUTH: Checking authorization header...');
    console.log('🔐 AUTH: Headers:', req.headers.authorization ? 'Authorization header EXISTS ✅' : 'NO Authorization header ❌');
    
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
      console.log('🔐 AUTH: Token extracted:', token ? token.substring(0, 20) + '...' : 'EMPTY');
    }

    if (!token) {
      console.error('🔐 AUTH: ❌ NO TOKEN - Rejecting request');
      return res.status(401).json({
        status: 'error',
        message: 'Please log in to access this resource'
      });
    }
    
    console.log('🔐 AUTH: Token found, verifying...');

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (jwtError) {
      // More specific error messages for debugging
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
    
    // Check database connection
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        status: 'error',
        message: 'Database is not connected. Please try again in a moment.'
      });
    }
    
    // Check if user still exists
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return res.status(401).json({
        status: 'error',
        message: 'User no longer exists'
      });
    }

    // Grant access to protected route
    req.user = currentUser;
    next();
  } catch (error) {
    // Log error for debugging
    console.error('Auth middleware error:', error.message);
    res.status(401).json({
      status: 'error',
      message: 'Authentication failed. Please log in again.'
    });
  }
};