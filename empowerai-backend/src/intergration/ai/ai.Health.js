const axios = require('axios');
const logger = require('../../utils/logger');

const AI_HEALTH_TIMEOUT_MS = Number(process.env.AI_HEALTH_TIMEOUT_MS || 15000);
const AI_HEALTH_STALE_MS = Number(process.env.AI_HEALTH_STALE_MS || 5 * 60 * 1000);

// ================= CACHE =================
let lastAiHealth = {
  status: 'unknown',
  openaiStatus: 'unknown',
  checkedAt: null,
  error: null,
};

// ================= HEALTH CHECK =================
async function checkAiHealth(force = false) {
  const aiServiceUrl = (process.env.AI_SERVICE_URL || 'http://localhost:8000').replace(/\/$/, '');
  const aiServiceToken = process.env.AI_SERVICE_API_KEY || process.env.AI_SERVICE_TOKEN;

  const now = Date.now();

  const cacheFresh =
    lastAiHealth.checkedAt &&
    now - lastAiHealth.checkedAt < AI_HEALTH_STALE_MS;

  // Return cached result if still fresh (avoids hammering AI service)
  if (!force && cacheFresh) {
    return {
      aiServiceStatus: `${lastAiHealth.status} (cached)`,
      aiServiceError: lastAiHealth.error,
    };
  }

  try {
    const res = await axios.get(`${aiServiceUrl}/health`, {
      timeout: AI_HEALTH_TIMEOUT_MS,
      headers: aiServiceToken ? { 'X-Service-Token': aiServiceToken } : {},
    });

    const openaiStatus = res.data?.openai_status || 'unknown';
    const status = res.data?.status === 'healthy' ? 'connected' : 'unhealthy';

    lastAiHealth = {
      status: `${status} (openai: ${openaiStatus})`,
      openaiStatus,
      checkedAt: now,
      error: null,
    };

    return {
      aiServiceStatus: lastAiHealth.status,
      aiServiceError: null,
    };

  } catch (error) {
    const isTimeout =
      error.code === 'ECONNABORTED' ||
      error.message?.toLowerCase().includes('timeout');

    const status = isTimeout ? 'sleeping' : 'disconnected';

    const errorInfo = {
      code: error.code || 'UNKNOWN',
      message: error.message,
      url: `${aiServiceUrl}/health`,
    };

    lastAiHealth = {
      status,
      openaiStatus: 'unknown',
      checkedAt: now,
      error: errorInfo,
    };

    return {
      aiServiceStatus: status,
      aiServiceError: errorInfo,
    };
  }
}

// ================= STARTUP PING =================
function pingAiServiceOnStartup() {
  const aiServiceUrl = (process.env.AI_SERVICE_URL || '').replace(/\/$/, '');
  const aiServiceToken = process.env.AI_SERVICE_API_KEY || process.env.AI_SERVICE_TOKEN;

  if (process.env.NODE_ENV !== 'production') return;

  setTimeout(async () => {
    try {
      const res = await axios.get(`${aiServiceUrl}/health`, {
        timeout: AI_HEALTH_TIMEOUT_MS,
        headers: aiServiceToken ? { 'X-Service-Token': aiServiceToken } : {},
      });

      logger.info('AI Service health check passed', {
        status: res.status,
        openaiStatus: res.data?.openai_status,
      });

    } catch (error) {
      const isTimeout =
        error.code === 'ECONNABORTED' ||
        error.message?.toLowerCase().includes('timeout');

      logger.warn('AI Service health check failed', {
        message: error.message,
        code: error.code,
        url: `${aiServiceUrl}/health`,
        note: isTimeout
          ? 'AI service likely cold start (Render sleeping)'
          : 'AI service unreachable',
      });
    }
  }, 2000);
}

module.exports = { checkAiHealth, pingAiServiceOnStartup };
