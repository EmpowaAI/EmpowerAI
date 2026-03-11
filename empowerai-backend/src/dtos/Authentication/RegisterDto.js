/**
 * RegisterDTO
 * Validates and sanitizes incoming registration request body.
 * Used by: POST /api/auth/register → AuthController.register → userService.createUser
 *
 * Note: Only name, email and password are required at registration.
 * Additional profile fields (age, province, education, skills, interests)
 * are collected separately when the user creates their twin.
 */

const { body, validationResult } = require('express-validator');

// ─────────────────────────────────────────────
// Validation rules
// ─────────────────────────────────────────────
const registerRules = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),

  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email address')
    .normalizeEmail(),

  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
    .matches(/[a-z]/).withMessage('Password must contain at least one lowercase letter')
    .matches(/[0-9]/).withMessage('Password must contain at least one number')
    .matches(/[^A-Za-z0-9]/).withMessage('Password must contain at least one special character'),
];

// ─────────────────────────────────────────────
// Validation middleware
// ─────────────────────────────────────────────
const validateRegister = (req, res, next) => {
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
// DTO builder — strips unknown fields before
// passing clean data to the service layer
// ─────────────────────────────────────────────
const toRegisterDTO = (body) => ({
  name:     body.name,
  email:    body.email,
  password: body.password,
});

module.exports = { registerRules, validateRegister, toRegisterDTO };
