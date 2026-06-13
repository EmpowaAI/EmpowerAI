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

  // Render log search is unreliable with deeply nested JSON objects.
  // Emit a plain-text line so correlation IDs are easily searchable.
  // Avoid leaking sensitive request fields (body/query are sanitized separately below for programming errors).
  try {
    // eslint-disable-next-line no-console
    console.error(`[${correlationId}] OperationalError ${statusCode} ${req.method} ${req.originalUrl}: ${err.name}: ${err.message}`);
  } catch {
    // ignore
  }

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

  try {
    // eslint-disable-next-line no-console
    console.error(`[${correlationId}] ProgrammingError 500 ${req.method} ${req.originalUrl}: ${err?.name || 'Error'}: ${err?.message || String(err)}`);
    if (err?.stack) {
      // eslint-disable-next-line no-console
      console.error(err.stack);
    }
  } catch {
    // ignore
  }

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

  // Body-parser / JSON parsing errors (happen before route handlers)
  // Without this, they get treated as "programming errors" and return a misleading 500.
  // Common cases on Render: large payloads (413) and malformed JSON (400).
  if (err?.type === 'entity.too.large' || err?.status === 413) {
    const payloadError = new AppError('Request payload too large. Please reduce the size and try again.', 413);
    return handleOperationalError(payloadError, req, res);
  }

  // Express.json SyntaxError typically has status=400 and includes the "body" key
  if (err instanceof SyntaxError && err?.status === 400 && 'body' in err) {
    const jsonError = new AppError('Invalid JSON in request body.', 400);
    return handleOperationalError(jsonError, req, res);
  }

  // Handle operational errors (AppError instances)
  if (err.isOperational) {
    return handleOperationalError(err, req, res);
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
