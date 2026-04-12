/**
 * ForgotPasswordDTO
 * Validates and sanitizes the forgot password request body.
 * Used by: POST /api/account/forgot → AccountController.forgotPassword → userService.forgotPassword
 */

const { body, validationResult } = require('express-validator');

// ─────────────────────────────────────────────
// Validation rules
// ─────────────────────────────────────────────
const forgotPasswordRules = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email address')
    .normalizeEmail(),
];

// ─────────────────────────────────────────────
// Validation middleware
// ─────────────────────────────────────────────
const validateForgotPassword = (req, res, next) => {
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
const toForgotPasswordDTO = (body) => ({
  email: body.email,
});

module.exports = { forgotPasswordRules, validateForgotPassword, toForgotPasswordDTO };
