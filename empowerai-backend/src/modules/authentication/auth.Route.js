const express = require('express');
const { register, login, validate, logout } = require('./auth.Controller');
const { authLimiter } = require('../../middleware/rateLimiter');
const { protect, restrictTo } = require('../../middleware/auth');
const { registerRules, validateRegister } = require('./authentication.Dto/RegisterDto');
const { loginRules, validateLogin }       = require('./authentication.Dto/LoginDto');

const router = express.Router();

router.use(authLimiter);


router.post('/register', registerRules, validateRegister, register);
router.post('/login',    loginRules,    validateLogin,    login);

router.get('/validate',  protect, validate);
router.post('/logout',   protect, logout);

module.exports = router;
