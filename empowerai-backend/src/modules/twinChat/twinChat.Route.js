const express = require('express');
const { sendMessage, sendTwinChat } = require('./twinChat.Controller');
const validateRequest = require('../../middleware/validate');
const { chatMessageSchema, chatTwinSchema } = require('../../utils/validators');
const auth = require('../../middleware/auth');
const router = express.Router();

// Chat endpoint - no authentication required for public chat
router
  .route('/')
  .post(validateRequest(chatMessageSchema), sendMessage);

// Digital Twin chat (protected)
router.post('/twin', auth, validateRequest(chatTwinSchema), sendTwinChat);

module.exports = router;
