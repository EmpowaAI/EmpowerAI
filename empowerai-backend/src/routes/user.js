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
 * @route GET /api/user/profile:id
 * @desc Get user profile by ID
 * @access Private
 */
router.get('/profile/:id', userController.getUserProfile);
 
/**
 * @route PUT /api/user/profile:id
 * @desc Update user profile by ID
 * @access Private
 */
router.put('/profile/:id', userController.updateUser);


/**
 * @route DELETE /api/user/profile:id
 * @desc Delete user profile by ID
 * @access Private
 */
router.delete('/profile/:id', userController.deleteUser);

module.exports = router;
 