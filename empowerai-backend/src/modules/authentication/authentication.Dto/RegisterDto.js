const { body, validationResult } = require('express-validator');
const logger = require('../../../utils/logger');

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

  // ─── POPIA Consent Validation ──────────────────────────────────────────────

  // Consent 1 — Required: data processing per Privacy Policy
  body('consentDataProcessing')
    .exists().withMessage('You must accept the Privacy Policy to register')
    .isBoolean().withMessage('Invalid consent value')
    .custom((value) => {
      if (value !== true && value !== 'true') {
        throw new Error('You must accept the Privacy Policy to register');
      }
      return true;
    }),

  // Consent 2 — Required: profile sharing with employers
  body('consentProfileSharing')
    .exists().withMessage('You must consent to profile sharing to register')
    .isBoolean().withMessage('Invalid consent value')
    .custom((value) => {
      if (value !== true && value !== 'true') {
        throw new Error('You must consent to profile sharing to register');
      }
      return true;
    }),

  // Consent 3 — Optional: AI-based matching (defaults to false if omitted)
  body('consentAiProcessing')
    .optional()
    .isBoolean().withMessage('Invalid consent value'),
];

const validateRegister = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    logger.warn('Registration validation failed', {
      email: req.body.email,
      errors: errors.array().map(e => ({ field: e.path, msg: e.msg })),
      correlationId: req.headers['x-correlation-id'],
    });

    return res.status(400).json({
      status: 'fail',
      errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
    });
  }
  next();
};

const toRegisterDTO = (body) => ({
  name:                  body.name,
  email:                 body.email,
  password:              body.password,
  // Normalise to strict booleans regardless of whether frontend sends
  // true (boolean) or "true" (string from FormData)
  consentDataProcessing: body.consentDataProcessing === true || body.consentDataProcessing === 'true',
  consentProfileSharing: body.consentProfileSharing === true || body.consentProfileSharing === 'true',
  consentAiProcessing:   body.consentAiProcessing   === true || body.consentAiProcessing   === 'true',
});

module.exports = { registerRules, validateRegister, toRegisterDTO };
