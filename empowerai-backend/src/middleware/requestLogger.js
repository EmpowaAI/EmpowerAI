/**
 * Request Logger Middleware
 * Principal Engineer Level: Enhanced logging with correlation IDs and performance tracking
 */

const { v4: uuidv4 } = require('uuid');
const logger = require('../utils/logger');

module.exports = (req, res, next) => {
  // Generate unique correlation ID for each request
  const correlationId = req.headers['x-correlation-id'] || uuidv4();
  req.id = correlationId;
  req.correlationId = correlationId;
  
  // Set correlation ID in response header
  res.setHeader('X-Correlation-ID', correlationId);
  
  const start = Date.now();

  // Log incoming request
  logger.logRequest(correlationId, req.method, req.originalUrl, req.ip);

  // Log response when finished
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.logResponse(correlationId, req.method, req.originalUrl, res.statusCode, duration);
  });

  next();
};
