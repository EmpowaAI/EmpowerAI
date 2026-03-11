/**
 * Global Error Handler Middleware
 * Principal Engineer Level: Comprehensive error handling with proper logging
 */

const logger = require('../utils/logger');
const { sendError } = require('../utils/response');
const { AppError, InternalServerError } = require('../utils/errors');

const SENSITIVE_KEYS = new Set([
  'password',
  'newPassword',
  'currentPassword',
  'token',
  'emailToken',
  'resetToken',
  'authorization',
  'auth',
  'jwt',
  'cvText',
  'message',
]);

const sanitizeObject = (value, depth = 0) => {
  if (value == null) return value;
  if (depth > 3) return '[REDACTED]';

  if (Array.isArray(value)) {
    return value.slice(0, 10).map((item) => sanitizeObject(item, depth + 1));
  }

  if (typeof value === 'object') {
    const out = {};
    for (const [key, val] of Object.entries(value)) {
      if (SENSITIVE_KEYS.has(key.toLowerCase())) {
        out[key] = '[REDACTED]';
      } else {
        out[key] = sanitizeObject(val, depth + 1);
      }
    }
    return out;
  }

  if (typeof value === 'string' && value.length > 500) {
    return `${value.slice(0, 100)}...[truncated]`;
  }

  return value;
};

/**
 * Handle operational errors (known errors)
 */
const handleOperationalError = (err, req, res) => {
  const statusCode = err.statusCode || 500;
  const correlationId = req.id || req.correlationId;

  // Log error with context
  logger.logError(err, correlationId, {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    user: req.user?.id,
  });

  return sendError(res, err, statusCode);
};

/**
 * Handle programming errors (unknown errors)
 */
const handleProgrammingError = (err, req, res) => {
  const correlationId = req.id || req.correlationId;

  // Log error with full context
  logger.logError(err, correlationId, {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    user: req.user?.id,
    body: sanitizeObject(req.body),
    query: sanitizeObject(req.query),
  });

  // Don't leak error details in production
  const message = process.env.NODE_ENV === 'production'
    ? 'Something went wrong. Please try again later.'
    : err.message;

  const error = new InternalServerError(message);
  return sendError(res, error, 500);
};

/**
 * Handle MongoDB duplicate key errors
 */
const handleMongoDuplicateKeyError = (err, req, res) => {
  const correlationId = req.id || req.correlationId;
  const field = Object.keys(err.keyValue || {})[0];
  const message = `${field} already exists`;

  // Special handling for twin duplicate errors - return success instead of error
  if (req.originalUrl?.includes('/twin') && field === 'userId') {
    logger.info('Twin duplicate detected in error handler, fetching existing twin', {
      correlationId,
      userId: err.keyValue?.userId,
      url: req.originalUrl
    });
    
    // Try to fetch and return existing twin
    const EconomicTwin = require('../models/EconomicTwin');
    const userId = err.keyValue?.userId || req.user?.id;
    
    if (userId) {
      EconomicTwin.findOne({ userId })
        .then(existingTwin => {
          if (existingTwin) {
            const { sendSuccess } = require('../utils/response');
            return sendSuccess(res, {
              twin: existingTwin,
              message: 'Twin already exists'
            });
          } else {
            // Twin exists but can't fetch it - return success anyway
            const { sendSuccess } = require('../utils/response');
            return sendSuccess(res, {
              twin: null,
              message: 'Twin already exists for this user',
              code: 'DUPLICATE_TWIN'
            });
          }
        })
        .catch(lookupError => {
          logger.error('Error fetching existing twin in error handler', {
            correlationId,
            error: lookupError.message
          });
          // Return success anyway to prevent page locking
          const { sendSuccess } = require('../utils/response');
          return sendSuccess(res, {
            twin: null,
            message: 'Twin already exists for this user',
            code: 'DUPLICATE_TWIN'
          });
        });
      return; // Don't continue with error handling
    }
  }

  logger.logError(err, correlationId, {
    method: req.method,
    url: req.originalUrl,
    duplicateField: field,
  });

  const { ConflictError } = require('../utils/errors');
  return sendError(res, new ConflictError(message), 409);
};

/**
 * Handle MongoDB validation errors
 */
const handleMongoValidationError = (err, req, res) => {
  const correlationId = req.id || req.correlationId;
  const errors = Object.values(err.errors || {}).map((e) => ({
    field: e.path,
    message: e.message,
  }));

  logger.logError(err, correlationId, {
    method: req.method,
    url: req.originalUrl,
    validationErrors: errors,
  });

  const { ValidationError } = require('../utils/errors');
  return sendError(res, new ValidationError('Validation failed', errors), 422);
};

/**
 * Handle JWT errors
 */
const handleJWTError = (req, res) => {
  const correlationId = req.id || req.correlationId;
  const { UnauthorizedError } = require('../utils/errors');

  logger.warn('Invalid JWT token', {
    correlationId,
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
  });

  return sendError(res, new UnauthorizedError('Invalid token. Please log in again.'), 401);
};

/**
 * Handle JWT expired errors
 */
const handleJWTExpiredError = (req, res) => {
  const correlationId = req.id || req.correlationId;
  const { UnauthorizedError } = require('../utils/errors');

  logger.warn('Expired JWT token', {
    correlationId,
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
  });

  return sendError(res, new UnauthorizedError('Your session has expired. Please log in again.'), 401);
};

/**
 * Global error handler middleware
 */
module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // Handle operational errors (AppError instances)
  if (err.isOperational) {
    return handleOperationalError(err, req, res);
  }

  // Handle MongoDB duplicate key error
  if (err.name === 'MongoServerError' && err.code === 11000) {
    return handleMongoDuplicateKeyError(err, req, res);
  }

  // Handle MongoDB validation error
  if (err.name === 'ValidationError') {
    return handleMongoValidationError(err, req, res);
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    return handleJWTError(req, res);
  }

  if (err.name === 'TokenExpiredError') {
    return handleJWTExpiredError(req, res);
  }

  // Handle all other errors (programming errors)
  return handleProgrammingError(err, req, res);
};
