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
    const queuedResult = await runAiTask(
      'chat:message',
      { message },
      async ({ message: taskMessage }) => {
        const response = await aiServiceClient.post('/chat', { message: taskMessage });
        return response.data
      },
      { timeout: 10000, includeJobId: true }
    );

    const replyData = queuedResult.result || queuedResult
    const meta = queuedResult.result ? { jobId: queuedResult.jobId, queued: queuedResult.queued } : null

    logger.info('Chat response received', { correlationId, replyLength: replyData?.reply?.length || 0 });

    res.status(200).json({
      status: 'success',
      data: {
        reply: replyData.reply || 'I received your message but got an empty response.',
        ...(meta ? { meta } : {})
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

/**
 * Digital Twin chat message
 * @route POST /api/chat/twin
 * @access Private
 */
exports.sendTwinChat = async (req, res, next) => {
  const correlationId = req.correlationId || req.id;

  try {
    const { messages } = req.body || {};

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'messages is required'
      });
    }

    const queuedResult = await runAiTask(
      'chat:twin',
      { messages },
      async ({ messages: taskMessages }) => {
        // Twin chat can take longer than standard chat (profile building + reasoning)
        const response = await aiServiceClient.post('/chat/twin', { messages: taskMessages }, { timeout: 45000 });
        return response.data;
      },
      { timeout: 45000, includeJobId: true }
    );

    const replyData = queuedResult.result || queuedResult;
    const meta = queuedResult.result ? { jobId: queuedResult.jobId, queued: queuedResult.queued } : null;

    logger.info('Twin chat response received', { correlationId, replyLength: replyData?.reply?.length || 0 });

    return res.status(200).json({
      status: 'success',
      data: {
        ...replyData,
        ...(meta ? { meta } : {})
      }
    });
  } catch (error) {
    logger.error('Twin chat error', {
      correlationId,
      error: error.message,
      status: error.response?.status
    });

    // If the AI service is down / waking up, don't surface as a generic 500
    const status = error.response?.status;

    if (status === 401 || status === 403) {
      return res.status(503).json({
        status: 'error',
        message: 'AI service authentication failed. Please try again later.',
      });
    }

    if (status === 404) {
      return res.status(503).json({
        status: 'error',
        message: 'AI service endpoint not found. Please try again later.',
      });
    }

    if (status === 429 || error.isRateLimit) {
      const retryAfter = error.retryAfter || error.response?.data?.retryAfter || 60;
      return res.status(429).json({
        status: 'error',
        message: 'Rate limited. Please wait a moment and try again.',
        retryAfter,
      });
    }

    // Render/connection timeouts: treat as service unavailable
    if (error.isRenderColdStart || error.isTimeout || error.code === 'ECONNABORTED') {
      return res.status(503).json({
        status: 'error',
        message: 'AI service is waking up. Please wait 30–60 seconds and try again.',
        retryAfter: 60,
      });
    }

    return res.status(503).json({
      status: 'error',
      message: error.message || 'AI service unavailable. Please try again later.',
    });
  }
};
