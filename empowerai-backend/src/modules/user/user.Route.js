
const express = require('express');
const router = express.Router();
const userController = require('./user.Controller');
const { protect, restrictTo } = require('../../middleware/auth');

const { updateUserRules, validateUpdateUser }          = require('./use.Dtos/UpdateUserDto');
const { changePasswordRules, validateChangePassword }  = require('../userAccount/userAccount.Dto/ChangePasswordDto');


router.use(protect);

router.get('/profile', protect,userController.getUser);
router.patch('/profile',protect, updateUserRules, validateUpdateUser, userController.updateUser);
router.patch('/change-password',protect, changePasswordRules, validateChangePassword, userController.changePassword);

module.exports = router;
