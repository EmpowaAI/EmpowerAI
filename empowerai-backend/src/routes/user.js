/**
 * User Routes
 * Handle profile related routes such as getting user info, updating profile, etc.
 */

const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');

//All routes are private, require authentication
router.use(auth);

/**
 * @route GET /api/user/profile
 * @desc Get current user profile
 * @access Private
 */
router.get('/profile', (req, res, next) => {
  // Pass user ID from auth middleware
  req.params.id = req.user.id;
  userController.getUserProfile(req, res, next);
});

/**
 * @route GET /api/user/profile/:id
 * @desc Get user profile by ID
 * @access Private
 */
router.get('/profile/:id', userController.getUserProfile);
 
/**
 * @route PUT /api/user/profile
 * @desc Update current user profile
 * @access Private
 */
router.put('/profile', (req, res, next) => {
  // Pass user ID from auth middleware
  req.params.id = req.user.id;
  userController.updateUser(req, res, next);
});

/**
 * @route PUT /api/user/profile/:id
 * @desc Update user profile by ID
 * @access Private
 */
router.put('/profile/:id', userController.updateUser);

/**
 * @route POST /api/user/change-password
 * @desc Change user password
 * @access Private
 */
router.post('/change-password', userController.changePassword);

/**
 * @route DELETE /api/user/profile
 * @desc Delete current user account
 * @access Private
 */
router.delete('/profile', (req, res, next) => {
  // Pass user ID from auth middleware
  req.params.id = req.user.id;
  userController.deleteUser(req, res, next);
});

/**
 * @route DELETE /api/user/profile/:id
 * @desc Delete user profile by ID
 * @access Private
 */
router.delete('/profile/:id', userController.deleteUser);

module.exports = router;
 