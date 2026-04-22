const express = require('express');
const { sendMessage, sendTwinChat } = require('./twinChat.Controller');
const validateRequest = require('../../middleware/validate');
const { chatMessageSchema, chatTwinSchema } = require('../../utils/validators');
const { protect, restrictTo } = require('../../middleware/auth');
const router = express.Router();

router
  .route('/')
  .post(validateRequest(chatMessageSchema), sendMessage);

router.post('/twin', protect, validateRequest(chatTwinSchema), sendTwinChat);

module.exports = router;
