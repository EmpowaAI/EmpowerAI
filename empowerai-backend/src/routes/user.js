/**
 * User Routes
 * Handles authenticated user profile management.
 * All routes are private — require valid JWT via auth middleware.
 */

const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');

// DTO validation middleware
const { updateUserRules, validateUpdateUser }          = require('../dtos/User/UpdateUserDto');
const { changePasswordRules, validateChangePassword }  = require('../dtos/User/ChangePasswordDto');

// All routes require authentication
router.use(auth);

// ─────────────────────────────────────────────
// Profile
// ─────────────────────────────────────────────

// Get current user's profile
// @route  GET /api/user/profile
router.get('/profile', userController.getUser);

// Update current user's profile
// @route  PATCH /api/user/profile
router.patch('/profile', updateUserRules, validateUpdateUser, userController.updateUser);

// ─────────────────────────────────────────────
// Password
// ─────────────────────────────────────────────

// Change password
// @route  PATCH /api/user/change-password
router.patch('/change-password', changePasswordRules, validateChangePassword, userController.changePassword);

module.exports = router;
