const axios = require('axios');
const logger = require('../utils/logger');

const AI_HEALTH_TIMEOUT_MS = Number(process.env.AI_HEALTH_TIMEOUT_MS || 15000);
const AI_HEALTH_STALE_MS = Number(process.env.AI_HEALTH_STALE_MS || 5 * 60 * 1000);

let lastAiHealth = {
  status: 'unknown',
  openaiStatus: 'unknown',
  checkedAt: null,
  error: null,
};

async function checkAiHealth() {
  const aiServiceUrl = process.env.AI_SERVICE_URL || 'http://localhost:8000';
  const aiServiceApiKey = process.env.AI_SERVICE_API_KEY;

  const now = Date.now();
  const cacheFresh =
    lastAiHealth.checkedAt && now - lastAiHealth.checkedAt < AI_HEALTH_STALE_MS;

  let aiServiceStatus = 'unknown';
  let aiServiceError = null;

  try {
    const healthResponse = await axios.get(`${aiServiceUrl}/health`, {
      timeout: AI_HEALTH_TIMEOUT_MS,
      headers: aiServiceApiKey ? { 'X-API-KEY': aiServiceApiKey } : undefined,
    });

    aiServiceStatus =
      healthResponse.data?.status === 'healthy' ? 'connected' : 'unhealthy';

    if (healthResponse.data) {
      const openaiStatus = healthResponse.data.openai_status || 'unknown';
      aiServiceStatus += ` (openai: ${openaiStatus})`;
      lastAiHealth = {
        status: aiServiceStatus,
        openaiStatus,
        checkedAt: now,
        error: null,
      };
    }
  } catch (error) {
    const isTimeout =
      error.code === 'ECONNABORTED' || error.message?.includes('timeout');

    aiServiceStatus = isTimeout ? 'sleeping' : 'disconnected';
    aiServiceError = {
      code: error.code || 'UNKNOWN',
      message: error.message,
      url: `${aiServiceUrl}/health`,
    };

    if (cacheFresh) {
      aiServiceStatus = `${lastAiHealth.status} (cached)`;
    } else {
      lastAiHealth = {
        status: aiServiceStatus,
        openaiStatus: 'unknown',
        checkedAt: now,
        error: aiServiceError,
      };
    }
  }

  return { aiServiceStatus, aiServiceError };
}

/**
 * Non-blocking startup ping — logs result, doesn't throw.
 */
function pingAiServiceOnStartup() {
  const aiServiceUrl = process.env.AI_SERVICE_URL;
  const aiServiceApiKey = process.env.AI_SERVICE_API_KEY;

  if (process.env.NODE_ENV !== 'production') return;

  setTimeout(() => {
    axios
      .get(`${aiServiceUrl}/health`, {
        timeout: AI_HEALTH_TIMEOUT_MS,
        headers: aiServiceApiKey ? { 'X-API-KEY': aiServiceApiKey } : undefined,
      })
      .then((response) => {
        logger.info('AI Service health check passed', {
          status: response.status,
          openaiStatus: response.data?.openai_status,
        });
      })
      .catch((error) => {
        const isTimeout =
          error.code === 'ECONNABORTED' || error.message?.includes('timeout');
        logger.warn('AI Service health check failed', {
          message: error.message,
          code: error.code,
          url: `${aiServiceUrl}/health`,
          note: isTimeout
            ? 'AI service likely sleeping (Render cold start)'
            : 'AI service health check failed',
        });
      });
  }, 2000);
}

module.exports = { checkAiHealth, pingAiServiceOnStartup };
