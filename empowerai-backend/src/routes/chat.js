const express = require('express');
const { sendMessage } = require('../controllers/chatController');
const validateRequest = require('../middleware/validate');
const { chatMessageSchema } = require('../utils/validators');
const router = express.Router();

// Chat endpoint - no authentication required for public chat
router
  .route('/')
  .post(validateRequest(chatMessageSchema), sendMessage);

module.exports = router;
