/**
 * Authentication Routes
 * Principal Engineer Level: Clean routes with validation and rate limiting
 */

const express = require('express');
const { register, login, validate } = require('../controllers/authController');
const validateRequest = require('../middleware/validate');
const { registerSchema, loginSchema } = require('../utils/validators');
const { authLimiter } = require('../middleware/rateLimiter');
const auth = require('../middleware/auth');

const router = express.Router();

// Apply strict rate limiting to auth endpoints
router.use(authLimiter);

// Public routes
router.post('/register', validateRequest(registerSchema), register);
router.post('/login', validateRequest(loginSchema), login);

// Protected route
router.get('/validate', auth, validate);

module.exports = router;
