const express = require('express');
const router = express.Router();
const userController = require('./user.Controller');
const { protect } = require('../../middleware/auth');
const { updateUserRules, validateUpdateUser } = require('./use.Dtos/UpdateUserDto');

router.use(protect);

router.get('/profile',  userController.getUser);
router.patch('/profile', updateUserRules, validateUpdateUser, userController.updateUser);

module.exports = router;
