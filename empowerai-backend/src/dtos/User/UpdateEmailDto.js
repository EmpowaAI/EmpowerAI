/**
 * UpdateEmailDTO
 * Validates an email change request.
 * Because email is used for authentication, changing it requires:
 *   1. The user's current password (to confirm identity)
 *   2. A verification email sent to the NEW address before it is applied
 *
 * Used by: POST /api/account/change-email → userService.requestEmailChange
 */

const { body, validationResult } = require('express-validator');

// ─────────────────────────────────────────────
// Validation rules
// ─────────────────────────────────────────────
const updateEmailRules = [
  body('newEmail')
    .trim()
    .notEmpty().withMessage('New email is required')
    .isEmail().withMessage('Please provide a valid email address')
    .normalizeEmail(),

  body('password')
    .notEmpty().withMessage('Your current password is required to change your email'),
];

// ─────────────────────────────────────────────
// Validation middleware
// ─────────────────────────────────────────────
const validateUpdateEmail = (req, res, next) => {
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
const toUpdateEmailDTO = (body) => ({
  newEmail: body.newEmail,
  password: body.password,
});

module.exports = { updateEmailRules, validateUpdateEmail, toUpdateEmailDTO };
