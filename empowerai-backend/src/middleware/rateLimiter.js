/**
 * Rate Limiting Middleware
 * Principal Engineer Level: Configurable rate limiting with different rules per endpoint
 */

const rateLimit = require('express-rate-limit');

/**
 * General API rate limiter
 */
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  handler: (req, res) => {
    const { RateLimitError } = require('../utils/errors');
    const { sendError } = require('../utils/response');
    const error = new RateLimitError('Too many requests, please try again later.', 15 * 60);
    return sendError(res, error, 429);
  },
});

/**
 * Strict rate limiter for authentication endpoints
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: 'Too many authentication attempts, please try again later.',
  skipSuccessfulRequests: true, // Don't count successful requests
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    const { RateLimitError } = require('../utils/errors');
    const { sendError } = require('../utils/response');
    const error = new RateLimitError('Too many authentication attempts, please try again in 15 minutes.', 15 * 60);
    return sendError(res, error, 429);
  },
});

/**
 * Rate limiter for AI service endpoints (more restrictive)
 * Removed custom keyGenerator to fix IPv6 error
 */
const aiServiceLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // Proactively throttle to 30 requests per minute per IP
  message: 'Too many AI service requests, please try again later.',
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  skipSuccessfulRequests: false, // Count all requests to protect upstream Tier limits
  // Removed custom keyGenerator - use default IP-based rate limiting (supports IPv6)
  handler: (req, res) => {
    const { RateLimitError } = require('../utils/errors');
    const { sendError } = require('../utils/response');
    
    // Calculate retryAfter in seconds
    const resetTime = req.rateLimit?.resetTime || Date.now() + (60 * 1000);
    const retryAfter = Math.max(1, Math.ceil((resetTime - Date.now()) / 1000));
    
    // Set Retry-After header (standard HTTP header for 429 responses)
    res.setHeader('Retry-After', retryAfter.toString());
    
    const error = new RateLimitError(
      'The AI service is currently processing many requests. Please wait a moment before trying again.',
      retryAfter
    );
    
    // Send error response with retryAfter in body
    return sendError(res, error, 429);
  },
});

module.exports = {
  apiLimiter,
  authLimiter,
  aiServiceLimiter,
};
