const AiUsageLog = require('../models/AiUsageLog');
const logger = require('./logger');

const logAiUsage = async (params) => {
  try {
    await AiUsageLog.create({
      userId: params.userId,
      feature: params.feature,
      tokensUsed: params.tokensUsed ?? 0,
      promptTokens: params.promptTokens ?? null,
      completionTokens: params.completionTokens ?? null,
      latencyMs: params.latencyMs ?? null,
      isError: params.isError ?? false,
      errorMessage: params.errorMessage ?? null,
      modelUsed: params.modelUsed ?? null,
      inputSummary: params.inputSummary ?? null,
    });
  } catch (err) {
    logger.error('aiUsageLogger: Failed to write AI usage log', { error: err });
  }
};

module.exports = { logAiUsage };
