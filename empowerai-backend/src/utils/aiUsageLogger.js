const logger = require('./logger');

const logAiUsage = async (params) => {
  logger.info('AI usage', {
    userId: params.userId,
    feature: params.feature,
    tokensUsed: params.tokensUsed ?? 0,
    latencyMs: params.latencyMs ?? null,
    isError: params.isError ?? false,
  });
};

module.exports = { logAiUsage };
