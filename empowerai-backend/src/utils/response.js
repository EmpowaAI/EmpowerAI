/**
 * Standardized API Response Utilities
 * Principal Engineer Level: Consistent API responses across all endpoints
 */

/**
 * Send success response
 * @param {object} res - Express response object
 * @param {any} data - Response data
 * @param {number} statusCode - HTTP status code (default: 200)
 * @param {object} meta - Additional metadata
 */
const sendSuccess = (res, data, statusCode = 200, meta = {}) => {
  const response = {
    status: 'success',
    data,
    timestamp: new Date().toISOString(),
  };

  // Add metadata if provided
  if (Object.keys(meta).length > 0) {
    response.meta = meta;
  }

  return res.status(statusCode).json(response);
};

/**
 * Send error response
 * @param {object} res - Express response object
 * @param {Error|string} error - Error object or error message
 * @param {number} statusCode - HTTP status code (default: 500)
 * @param {object} details - Additional error details
 */
const sendError = (res, error, statusCode = 500, details = {}) => {
  const isErrorObject = error instanceof Error;
  const message = isErrorObject ? error.message : error;
  const errorName = isErrorObject ? error.name : 'Error';

  const response = {
    status: 'error',
    message,
    timestamp: new Date().toISOString(),
  };

  // Add error code if available
  if (isErrorObject && error.statusCode) {
    response.statusCode = error.statusCode;
  } else if (statusCode) {
    response.statusCode = statusCode;
  }

  // Add error name
  response.error = errorName;

  // Add details if provided
  if (Object.keys(details).length > 0) {
    response.details = details;
  }

  // Add validation errors if available
  if (isErrorObject && error.errors && Array.isArray(error.errors)) {
    response.errors = error.errors;
  }

  // Add retry information for rate limits
  if (isErrorObject && error.retryAfter) {
    response.retryAfter = error.retryAfter;
  }

  // Add stack trace in development
  if (process.env.NODE_ENV === 'development' && isErrorObject && error.stack) {
    response.stack = error.stack;
  }

  return res.status(statusCode).json(response);
};

/**
 * Send paginated response
 * @param {object} res - Express response object
 * @param {Array} data - Array of data items
 * @param {number} page - Current page number
 * @param {number} limit - Items per page
 * @param {number} total - Total number of items
 */
const sendPaginated = (res, data, page, limit, total) => {
  const totalPages = Math.ceil(total / limit);
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;

  return sendSuccess(
    res,
    data,
    200,
    {
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage,
        hasPrevPage,
      },
    }
  );
};

module.exports = {
  sendSuccess,
  sendError,
  sendPaginated,
};

