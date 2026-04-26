const { sendError } = require('../utils/response');

const requireRole = (...roles) => (req, res, next) => {
  if (!req.user) {
    return sendError(res, 'Authentication required', 401);
  }

  if (!roles.includes(req.user.role)) {
    return sendError(res, 'You do not have permission to access this resource', 403);
  }

  next();
};

module.exports = { requireRole };
