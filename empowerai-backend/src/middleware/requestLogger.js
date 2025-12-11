/**
 * Request Logger Middleware
 * Logs all incoming requests with correlation IDs for debugging
 */

const { v4: uuidv4 } = require('uuid');

module.exports = (req, res, next) => {
  // Generate unique correlation ID for each request
  req.id = uuidv4();
  const start = Date.now();

  // Log request
  console.log(`[${req.id}] ${req.method} ${req.originalUrl} - IP: ${req.ip}`);

  // Log response when finished
  res.on('finish', () => {
    const duration = Date.now() - start;
    const statusColor = res.statusCode >= 400 ? '\x1b[31m' : '\x1b[32m'; // Red for errors, green for success
    console.log(
      `${statusColor}[${req.id}] ${req.method} ${req.originalUrl} - Status: ${res.statusCode} - Duration: ${duration}ms\x1b[0m`
    );
  });

  next();
};

