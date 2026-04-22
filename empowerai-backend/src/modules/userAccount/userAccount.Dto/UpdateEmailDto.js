
const { body, validationResult } = require('express-validator');

const updateEmailRules = [
  body('newEmail')
    .trim()
    .notEmpty().withMessage('New email is required')
    .isEmail().withMessage('Please provide a valid email address')
    .normalizeEmail(),

  body('password')
    .notEmpty().withMessage('Your current password is required to change your email'),
];

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

const toUpdateEmailDTO = (body) => ({
  newEmail: body.newEmail,
  password: body.password,
});

module.exports = { updateEmailRules, validateUpdateEmail, toUpdateEmailDTO };
