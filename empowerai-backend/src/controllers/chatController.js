/**
 * Chat Controller
 * Proxies chat requests to the AI service
 */

const aiServiceClient = require('../services/aiServiceClient');
const logger = require('../utils/logger');
const { runAiTask } = require('../queues/aiQueue');

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
    const replyData = await runAiTask(
      'chat:message',
      { message },
      async ({ message: taskMessage }) => {
        const response = await aiServiceClient.post('/chat', { message: taskMessage });
        return response.data
      },
      { timeout: 10000 }
    );

    logger.info('Chat response received', { correlationId, replyLength: replyData?.reply?.length || 0 });

    res.status(200).json({
      status: 'success',
      data: {
        reply: replyData.reply || 'I received your message but got an empty response.'
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
