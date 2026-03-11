/**
 * LoginDTO
 * Validates and sanitizes incoming login request body.
 * Used by: POST /api/auth/login → AuthController.login → userService.findByEmail
 */

const { body, validationResult } = require('express-validator');

// ─────────────────────────────────────────────
// Validation rules
// ─────────────────────────────────────────────
const loginRules = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email address')
    .normalizeEmail(),

  body('password')
    .notEmpty().withMessage('Password is required'),
];

// ─────────────────────────────────────────────
// Validation middleware
// ─────────────────────────────────────────────
const validateLogin = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: 'fail',
      errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
    });
  }
  next();
};

// ─────────────────────────────────────────────
// DTO builder
// ─────────────────────────────────────────────
const toLoginDTO = (body) => ({
  email:    body.email,
  password: body.password,
});

module.exports = { loginRules, validateLogin, toLoginDTO };
