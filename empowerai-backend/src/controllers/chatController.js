/**
 * Chat Controller
 * Proxies chat requests to the AI service
 */

const aiServiceClient = require('../services/aiServiceClient');
const logger = require('../utils/logger');

/**
 * Send chat message
 * @route POST /api/chat
 * @access Public (no auth required for chat)
 */
exports.sendMessage = async (req, res, next) => {
  const correlationId = req.correlationId || req.id;
  
  try {
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({
        status: 'error',
        message: 'Message is required'
      });
    }

    logger.info('Chat message received', { correlationId, messageLength: message.length });

    // Call AI service chat endpoint
    const response = await aiServiceClient.post('/chat', { message });

    logger.info('Chat response received', { correlationId, replyLength: response.data?.reply?.length || 0 });

    res.status(200).json({
      status: 'success',
      data: {
        reply: response.data.reply || 'I received your message but got an empty response.'
      }
    });
  } catch (error) {
    logger.error('Chat error', {
      correlationId,
      error: error.message,
      status: error.response?.status
    });

    // Handle specific errors
    if (error.response?.status === 503) {
      return res.status(503).json({
        status: 'error',
        message: 'AI service is not configured. Please try again later.'
      });
    }

    next(error);
  }
};
