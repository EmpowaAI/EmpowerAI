/**
 * Authentication Routes
 * Principal Engineer Level: Clean routes with validation and rate limiting
 */

const express = require('express');
const { register, login, validate, logout } = require('./auth.Controller');
const { authLimiter } = require('../../middleware/rateLimiter');
const auth = require('../../middleware/auth');

// DTO validation middleware
const { registerRules, validateRegister } = require('./authentication.Dto/RegisterDto');
const { loginRules, validateLogin }       = require('./authentication.Dto/LoginDto');

const router = express.Router();

// Apply strict rate limiting to all auth endpoints
router.use(authLimiter);

// ─────────────────────────────────────────────
// Public routes
// ─────────────────────────────────────────────
router.post('/register', registerRules, validateRegister, register);
router.post('/login',    loginRules,    validateLogin,    login);

// ─────────────────────────────────────────────
// Protected routes
// ─────────────────────────────────────────────
router.get('/validate',  auth, validate);
router.post('/logout',   auth, logout);

module.exports = router;
