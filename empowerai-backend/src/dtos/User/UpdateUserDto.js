/**
 * UpdateUserDTO
 * Validates and sanitizes profile update requests.
 * Email and password are intentionally excluded — they have their own flows.
 *
 * Used by: PATCH /api/user/profile → userService.updateUser
 */

const { body, validationResult } = require('express-validator');

// ─────────────────────────────────────────────
// Validation rules
// ─────────────────────────────────────────────
const updateUserRules = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),

  body('avatar')
    .optional()
    .trim()
    .isURL().withMessage('Avatar must be a valid URL'),

  // Block attempts to update email or password through this route
  body('email')
    .not().exists().withMessage('Email cannot be updated here. Use /api/account/change-email instead.'),

  body('password')
    .not().exists().withMessage('Password cannot be updated here. Use /api/account/change-password instead.'),
];

// ─────────────────────────────────────────────
// Validation middleware
// ─────────────────────────────────────────────
const validateUpdateUser = (req, res, next) => {
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
// DTO builder — only passes allowed fields to service
// ─────────────────────────────────────────────
const toUpdateUserDTO = (body) => {
  const allowed = ['name', 'age', 'province', 'education', 'skills', 'interests', 'avatar'];
  const dto = {};

  for (const field of allowed) {
    if (body[field] !== undefined) {
      dto[field] = body[field];
    }
  }

  return dto;
};

module.exports = { updateUserRules, validateUpdateUser, toUpdateUserDTO };
