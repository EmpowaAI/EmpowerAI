/**
 * ChangePasswordDTO
 * Validates and sanitizes a change password request.
 * Requires the user's current password to confirm identity.
 *
 * Used by: PATCH /api/account/change-password → userService.changePassword
 */

const { body, validationResult } = require('express-validator');

// ─────────────────────────────────────────────
// Validation rules
// ─────────────────────────────────────────────
const changePasswordRules = [
  body('currentPassword')
    .notEmpty().withMessage('Current password is required'),

  body('newPassword')
    .notEmpty().withMessage('New password is required')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
    .matches(/[a-z]/).withMessage('Password must contain at least one lowercase letter')
    .matches(/[0-9]/).withMessage('Password must contain at least one number')
    .matches(/[^A-Za-z0-9]/).withMessage('Password must contain at least one special character')
    .custom((value, { req }) => value !== req.body.currentPassword)
    .withMessage('New password must be different from your current password'),

  body('confirmPassword')
    .notEmpty().withMessage('Please confirm your new password')
    .custom((value, { req }) => value === req.body.newPassword)
    .withMessage('Passwords do not match'),
];

// ─────────────────────────────────────────────
// Validation middleware
// ─────────────────────────────────────────────
const validateChangePassword = (req, res, next) => {
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
// DTO builder — confirmPassword excluded,
// only used for validation above
// ─────────────────────────────────────────────
const toChangePasswordDTO = (body) => ({
  currentPassword: body.currentPassword,
  newPassword:     body.newPassword,
});

module.exports = { changePasswordRules, validateChangePassword, toChangePasswordDTO };
