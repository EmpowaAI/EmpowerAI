/**
 * Structured Logging Utility
 * Principal Engineer Level: Production-ready logging with correlation IDs
 */

const winston = require('winston');
const path = require('path');

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Define colors for each level
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

// Tell winston about our colors
winston.addColors(colors);

// Define log format
const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

// Console format for development
const consoleFormat = winston.format.combine(
  winston.format.colorize({ all: true }),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.printf(
    (info) => {
      const { timestamp, level, message, correlationId, ...meta } = info;
      let log = `${timestamp} [${level}]: ${message}`;
      
      if (correlationId) {
        log = `${timestamp} [${correlationId}] [${level}]: ${message}`;
      }
      
      if (Object.keys(meta).length > 0 && meta.stack) {
        log += `\n${meta.stack}`;
      } else if (Object.keys(meta).length > 0) {
        log += ` ${JSON.stringify(meta)}`;
      }
      
      return log;
    }
  )
);

// Define transports
const transports = [
  // Console transport
  new winston.transports.Console({
    format: process.env.NODE_ENV === 'production' ? format : consoleFormat,
  }),
];

// Add file transports in production
if (process.env.NODE_ENV === 'production') {
  // Error log file
  transports.push(
    new winston.transports.File({
      filename: path.join(__dirname, '../../logs/error.log'),
      level: 'error',
      format: format,
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    })
  );

  // Combined log file
  transports.push(
    new winston.transports.File({
      filename: path.join(__dirname, '../../logs/combined.log'),
      format: format,
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    })
  );
}

// Create logger instance
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
  levels,
  format,
  transports,
  // Don't exit on handled exceptions
  exitOnError: false,
});

// Create a stream object for Morgan HTTP logging
logger.stream = {
  write: (message) => {
    logger.http(message.trim());
  },
};

/**
 * Create a child logger with correlation ID
 * @param {string} correlationId - Unique request ID
 * @returns {winston.Logger} Child logger instance
 */
logger.withCorrelationId = (correlationId) => {
  return logger.child({ correlationId });
};

/**
 * Log API request
 * @param {string} correlationId - Request correlation ID
 * @param {string} method - HTTP method
 * @param {string} url - Request URL
 * @param {string} ip - Client IP
 */
logger.logRequest = (correlationId, method, url, ip) => {
  logger.info('Incoming request', {
    correlationId,
    method,
    url,
    ip,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Log API response
 * @param {string} correlationId - Request correlation ID
 * @param {string} method - HTTP method
 * @param {string} url - Request URL
 * @param {number} statusCode - Response status code
 * @param {number} duration - Request duration in ms
 */
logger.logResponse = (correlationId, method, url, statusCode, duration) => {
  const level = statusCode >= 400 ? 'warn' : 'info';
  logger[level]('Request completed', {
    correlationId,
    method,
    url,
    statusCode,
    duration: `${duration}ms`,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Log error with context
 * @param {Error} error - Error object
 * @param {string} correlationId - Request correlation ID
 * @param {object} context - Additional context
 */
logger.logError = (error, correlationId = null, context = {}) => {
  logger.error('Error occurred', {
    correlationId,
    error: {
      message: error.message,
      stack: error.stack,
      name: error.name,
      ...(error.statusCode && { statusCode: error.statusCode }),
      ...(error.isOperational !== undefined && { isOperational: error.isOperational }),
    },
    context,
    timestamp: new Date().toISOString(),
  });
};

module.exports = logger;

