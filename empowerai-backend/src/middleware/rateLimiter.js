/**
 * Rate Limiting Middleware
 * Principal Engineer Level: Configurable rate limiting with different rules per endpoint
 */

const rateLimit = require('express-rate-limit');
const crypto = require('crypto');

const num = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const isEnabled = (value, defaultEnabled = true) => {
  if (value == null) return defaultEnabled;
  const v = String(value).trim().toLowerCase();
  if (['0', 'false', 'no', 'off'].includes(v)) return false;
  if (['1', 'true', 'yes', 'on'].includes(v)) return true;
  return defaultEnabled;
};

/**
 * General API rate limiter
 */
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: num(process.env.API_RATE_LIMIT_MAX, 100), // Limit each IP to N requests per windowMs
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
  max: num(process.env.AUTH_RATE_LIMIT_MAX, 5), // Limit each IP to N requests per windowMs
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
 * Keyed by bearer token when present to avoid NAT/shared-IP throttling.
 */
const aiServiceLimiter = rateLimit({
  windowMs: num(process.env.AI_RATE_LIMIT_WINDOW_MS, 60 * 1000), // 1 minute
  max: num(process.env.AI_RATE_LIMIT_MAX, 60), // default 60 req/min per token/IP
  message: 'Too many AI service requests, please try again later.',
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  skipSuccessfulRequests: false, // Count all requests to protect upstream Tier limits
  keyGenerator: (req) => {
    const auth = req.headers?.authorization;
    if (typeof auth === 'string' && auth.toLowerCase().startsWith('bearer ')) {
      return `bearer:${crypto.createHash('sha256').update(auth).digest('hex')}`;
    }
    const adminKey = req.headers?.['x-admin-key'];
    if (typeof adminKey === 'string' && adminKey.trim()) {
      return `admin:${crypto.createHash('sha256').update(adminKey.trim()).digest('hex')}`;
    }
    return req.ip;
  },
  handler: (req, res) => {
    const { RateLimitError } = require('../utils/errors');
    const { sendError } = require('../utils/response');
    
    // Calculate retryAfter in seconds
    const resetTime = req.rateLimit?.resetTime || Date.now() + num(process.env.AI_RATE_LIMIT_WINDOW_MS, 60 * 1000);
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
  isEnabled,
};
