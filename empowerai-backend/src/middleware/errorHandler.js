/**
 * Global Error Handler Middleware
 * Principal Engineer Level: Comprehensive error handling with proper logging
 */

const logger = require('../utils/logger');
const { sendError } = require('../utils/response');
const { AppError, InternalServerError } = require('../utils/errors');

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
    body: req.body,
    query: req.query,
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
