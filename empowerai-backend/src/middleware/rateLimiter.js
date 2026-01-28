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
 * Uses user ID if available, otherwise falls back to IP
 */
const aiServiceLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // Limit to 30 requests per minute (increased from 10)
  message: 'Too many AI service requests, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  // Use user ID for rate limiting if authenticated, otherwise use IP
  keyGenerator: (req) => {
    return req.user?.id || req.ip || 'unknown';
  },
  handler: (req, res) => {
    const { RateLimitError } = require('../utils/errors');
    const { sendError } = require('../utils/response');
    const retryAfter = Math.ceil((req.rateLimit.resetTime - Date.now()) / 1000);
    const error = new RateLimitError('Too many AI service requests, please try again in a minute.', retryAfter || 60);
    return sendError(res, error, 429);
  },
});

module.exports = {
  apiLimiter,
  authLimiter,
  aiServiceLimiter,
};

