const express = require('express');
const { sendMessage } = require('../controllers/chatController');
const router = express.Router();

// Chat endpoint - no authentication required for public chat
router.post('/', sendMessage);

module.exports = router;
