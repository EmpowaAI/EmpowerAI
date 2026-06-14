const express = require('express');
const router = express.Router();
const authController = require('./auth.Controller');

router.post('/register', authController.register);
router.post('/login',    authController.login);
router.post('/refresh',  authController.refresh);
router.get('/validate',  authController.validate);
router.post('/logout',   authController.logout);

module.exports = router;
