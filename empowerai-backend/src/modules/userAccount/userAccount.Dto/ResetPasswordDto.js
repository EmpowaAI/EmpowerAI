/**
 * ResetPasswordDTO
 * Validates and sanitizes the reset password request body.
 * Used by: POST /api/account/reset → AccountController.resetPassword → userService.resetPassword
 */

const { body, validationResult } = require('express-validator');

// ─────────────────────────────────────────────
// Validation rules
// ─────────────────────────────────────────────
const resetPasswordRules = [
  body('token')
    .trim()
    .notEmpty().withMessage('Reset token is required')
    .isHexadecimal().withMessage('Invalid reset token format')
    .isLength({ min: 64, max: 64 }).withMessage('Invalid reset token length'),

  body('newPassword')
    .notEmpty().withMessage('New password is required')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
    .matches(/[a-z]/).withMessage('Password must contain at least one lowercase letter')
    .matches(/[0-9]/).withMessage('Password must contain at least one number')
    .matches(/[^A-Za-z0-9]/).withMessage('Password must contain at least one special character'),

  body('confirmPassword')
    .notEmpty().withMessage('Please confirm your new password')
    .custom((value, { req }) => value === req.body.newPassword)
    .withMessage('Passwords do not match'),
];

// ─────────────────────────────────────────────
// Validation middleware
// ─────────────────────────────────────────────
const validateResetPassword = (req, res, next) => {
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
// DTO builder — confirmPassword is intentionally
// excluded; it's only used for validation above
// ─────────────────────────────────────────────
const toResetPasswordDTO = (body) => ({
  token:       body.token,
  newPassword: body.newPassword,
});

module.exports = { resetPasswordRules, validateResetPassword, toResetPasswordDTO };
