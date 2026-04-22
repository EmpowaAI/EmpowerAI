
const { body, validationResult } = require('express-validator');

const forgotPasswordRules = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email address')
    .normalizeEmail(),
];

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

const toForgotPasswordDTO = (body) => ({
  email: body.email,
});

module.exports = { forgotPasswordRules, validateForgotPassword, toForgotPasswordDTO };
