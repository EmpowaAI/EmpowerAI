const express = require('express');
const { getProfile, updateProfile, uploadAvatar } = require('../controllers/userController');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const router = express.Router();

// All routes protected by authentication
router.use(auth);

router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.post('/avatar', upload.single('avatar'), uploadAvatar);

module.exports = router;