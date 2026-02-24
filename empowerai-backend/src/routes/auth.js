/**
 * Authentication Routes
 * Handles:
 * - Register
 * - Login
 * - Refresh Token
 * - Logout
 * - Validate Token
 */

const express = require('express');
const { register, login, refreshToken, logout, validate } = require('../controllers/authController');
const validateRequest = require('../middleware/validate');
const { registerSchema, loginSchema } = require('../utils/validators');
const { authLimiter } = require('../middleware/rateLimiter');
const auth = require('../middleware/auth');

const router = express.Router();

router.use(authLimiter);

// Public routes
router.post('/register', validateRequest(registerSchema), register);
router.post('/login', validateRequest(loginSchema), login);
router.post('/refresh-token', refreshToken);

// Protected routes
router.post('/logout', auth, logout);
router.get('/validate', auth, validate);

module.exports = router;