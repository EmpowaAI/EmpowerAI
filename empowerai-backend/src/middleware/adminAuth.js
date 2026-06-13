const logger = require('../utils/logger');

module.exports = (req, res, next) => {
  
  if (!req.user) {
    return res.status(401).json({
      status: 'error',
      message: 'Authentication required',
    });
  }

  if (req.user.role !== 'admin') {
    logger.warn('Admin access denied', {
      userId: req.user.id,
      email: req.user.email,
    });
    return res.status(403).json({
      status: 'error',
      message: 'Admin access required',
    });
  }

  return next();
};