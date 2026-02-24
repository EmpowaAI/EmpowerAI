/**
 * User Routes
 * Handles:
 * - Get profile
 * - Update profile
 * - Delete account
 */

const express = require('express');
const { getProfile, updateProfile, deleteAccount } = require('../controllers/userController');
const validateRequest = require('../middleware/validate');
const { updateProfileSchema } = require('../utils/validators');
const auth = require('../middleware/auth');

const router = express.Router();

// All user routes are protected
router.use(auth);

router.get('/profile', getProfile);
router.patch('/profile', validateRequest(updateProfileSchema), updateProfile);
router.delete('/account', deleteAccount);

module.exports = router;