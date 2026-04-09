/**
 * cvAnalyser.Service.js
 * Owns all CV business logic:
 *  - AI analysis orchestration (text & file)
 *  - Fallback handling
 *  - Persistence via repository
 *  - Economic twin trigger
 */

const cvProfileRepository = require('./cvAnalyser.Repository');
const logger = require('../../utils/logger');
const twinService = require('../twinBuilder/twinBuilder.Service');
const aiServiceClient = require('../../intergration/ai/ai.ServiceClient');
const { runAiTask } = require('../../intergration/queues/aiQueue');
const { buildFallbackAnalysis } = require('../../utils/cvFallback.util');
const { extractTextFromUploadedFile } = require('../../utils/cvParser.util');
const FormData = require('form-data');
const axios = require('axios');

const REQUEST_TIMEOUT = 30000;
const FILE_TIMEOUT = 60000;

// ─── Internal helpers ──────────────────────────────────────────────────────────

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const callWithRateLimitRetry = async (fn) => {
  try {
    return await fn();
  } catch (error) {
    const isRateLimit = error?.isRateLimit || error?.response?.status === 429;
    if (!isRateLimit) throw error;
    const retryAfter = error.retryAfter || error.response?.data?.retryAfter || 60;
    await sleep(Math.min(retryAfter, 120) * 1000);
    return await fn();
  }
};

// ─── Persistence ───────────────────────────────────────────────────────────────

/**
 * Save or update a CvProfile after a successful AI analysis.
 * Triggers economic twin build after save.
 */
async function saveAnalysisResult({ userId, file, rawText, analysis, isFallback = false }) {
  try {
    const profile = await cvProfileRepository.saveOrUpdate({
      userId,
      filename: file?.originalname ?? null,
      mimetype: file?.mimetype ?? null,
      fileSize: file?.size ?? null,
      rawText,
      analysis,
      isFallback,
    });

    logger.info('[CvService] CvProfile saved', {
      userId,
      profileId: profile._id,
      score: profile.analysis?.score,
      isFallback,
      isComplete: profile.isComplete,
    });

    if (profile) {
  twinService.buildFromAnalysis(profile.analysis, userId).catch((err) => {
    logger.error('[CvService] Failed to build economic twin', {
      userId,
      error: err.message,
      stack: err.stack,
    });
  });
}
    return profile;
  } catch (error) {
    logger.error('[CvService] Failed to save CvProfile', {
      userId,
      error: error.message,
      stack: error.stack,
    });
    return null;
  }
}

// ─── Text-based CV analysis ────────────────────────────────────────────────────

/**
 * Analyse a CV submitted as plain text.
 * Returns { analysis, profileId, isFallback, fallbackMessage?, meta? }
 */
async function analyzeFromText({ userId, cvText, jobRequirementsArray }) {
  try {
    const queuedResult = await runAiTask(
      'cv:analyze',
      { cvText, jobRequirements: jobRequirementsArray },
      async ({ cvText: taskCvText, jobRequirements: taskRequirements }) => {
        const response = await callWithRateLimitRetry(() =>
          aiServiceClient.post('/cv/analyze', { cvText: taskCvText, jobRequirements: taskRequirements })
        );
        return response.data;
      },
      { timeout: REQUEST_TIMEOUT, includeJobId: true }
    );

    const analysis = queuedResult.result || queuedResult;
    const meta = queuedResult.result
      ? { jobId: queuedResult.jobId, queued: queuedResult.queued }
      : undefined;

    const savedProfile = await saveAnalysisResult({
      userId,
      file: null,
      rawText: cvText,
      analysis,
      isFallback: false,
    });

    return { analysis, profileId: savedProfile?._id ?? null, isFallback: false, meta };
  } catch (error) {
    return _handleAnalysisError({ error, userId, cvText, jobRequirementsArray, file: null });
  }
}

// ─── File-based CV analysis ────────────────────────────────────────────────────

/**
 * Analyse a CV submitted as a file upload.
 * Returns { analysis, profileId, isFallback, fallbackMessage?, meta? }
 */
async function analyzeFromFile({ userId, file, jobRequirementsArray }) {
  const aiServiceUrl = process.env.AI_SERVICE_URL || 'http://localhost:8000';
  const aiServiceApiKey = process.env.AI_SERVICE_API_KEY;

  try {
    const queuedResult = await runAiTask(
      'cv:analyze-file',
      {
        fileBuffer: file.buffer.toString('base64'),
        filename: file.originalname,
        mimetype: file.mimetype,
        jobRequirements: jobRequirementsArray || [],
      },
      async (payload) => {
        const payloadForm = new FormData();
        payloadForm.append('cvFile', Buffer.from(payload.fileBuffer, 'base64'), {
          filename: payload.filename,
          contentType: payload.mimetype,
        });
        if (payload.jobRequirements && payload.jobRequirements.length > 0) {
          payloadForm.append('jobRequirements', JSON.stringify(payload.jobRequirements));
        }
        return callWithRateLimitRetry(() =>
          axios.post(`${aiServiceUrl}/api/cv/analyze-file`, payloadForm, {
            headers: {
              ...payloadForm.getHeaders(),
              ...(aiServiceApiKey ? { 'X-API-KEY': aiServiceApiKey } : {}),
            },
            timeout: FILE_TIMEOUT,
            maxContentLength: 10 * 1024 * 1024,
            maxBodyLength: 10 * 1024 * 1024,
          })
        ).then((response) => response.data);
      },
      { timeout: FILE_TIMEOUT, includeJobId: true }
    );

    const analysis = queuedResult.result || queuedResult;
    const meta = queuedResult.result
      ? { jobId: queuedResult.jobId, queued: queuedResult.queued }
      : undefined;

    const savedProfile = await saveAnalysisResult({
      userId,
      file,
      rawText: '',
      analysis,
      isFallback: false,
    });

    return { analysis, profileId: savedProfile?._id ?? null, isFallback: false, meta };
  } catch (error) {
    return _handleAnalysisError({ error, userId, cvText: null, jobRequirementsArray, file });
  }
}

// ─── CV revamp ─────────────────────────────────────────────────────────────────

/**
 * Request a CV revamp from the AI service.
 * Returns { revamp, meta? }
 * Throws on failure — controller passes to next(error).
 */
async function revampCv({ cvData }) {
  const queuedResult = await runAiTask(
    'cv:revamp',
    { cvData },
    async ({ cvData: taskCvData }) => {
      const response = await callWithRateLimitRetry(() =>
        aiServiceClient.post('/cv/revamp', { cvData: taskCvData })
      );
      return response.data;
    },
    { timeout: FILE_TIMEOUT, includeJobId: true }
  );

  const revamp = queuedResult.result || queuedResult;
  const meta = queuedResult.result
    ? { jobId: queuedResult.jobId, queued: queuedResult.queued }
    : undefined;

  return { revamp, meta };
}

// ─── Profile queries ───────────────────────────────────────────────────────────

async function getCvProfile(userId) {
  return cvProfileRepository.findByUserId(userId);
}

async function hasCompleteProfile(userId) {
  return cvProfileRepository.hasCompleteProfile(userId);
}

async function deleteCvProfile(userId) {
  return cvProfileRepository.deleteByUserId(userId);
}

// ─── Private: unified error → fallback handler ─────────────────────────────────

async function _handleAnalysisError({ error, userId, cvText, jobRequirementsArray, file }) {
  const errorMessage = error.message || '';
  const status = error.response?.status;
  const aiServiceUrl = process.env.AI_SERVICE_URL || 'http://localhost:8000';

  const isRateLimit =
    error.isRateLimit ||
    status === 429 ||
    errorMessage.toLowerCase().includes('rate limit');

  const isServiceDown =
    status === 401 ||
    status === 503 ||
    status >= 500 ||
    error.code === 'ECONNREFUSED' ||
    error.code === 'ECONNABORTED' ||
    error.code === 'ENOTFOUND' ||
    error.code === 'ETIMEDOUT' ||
    !error.response;

  // Errors that should NOT fall back — rethrow so controller can handle properly
  if (status === 400) throw error;

  if (isRateLimit || isServiceDown) {
    const retryAfter = error.retryAfter || error.response?.data?.retryAfter || 60;

    let rawText = cvText || '';
    if (!rawText && file) {
      try {
        rawText = await extractTextFromUploadedFile(file);
      } catch (_) {}
    }

    const analysis = buildFallbackAnalysis(rawText, jobRequirementsArray);

    const savedProfile = await saveAnalysisResult({
      userId,
      file: file ?? null,
      rawText,
      analysis,
      isFallback: true,
    });

    const fallbackMessage = isRateLimit
      ? `AI service is rate limited. Showing basic CV insights while you wait ${retryAfter} seconds.`
      : _buildNetworkMessage(error, aiServiceUrl);

    return {
      analysis,
      profileId: savedProfile?._id ?? null,
      isFallback: true,
      fallbackMessage,
    };
  }

  // Unknown error — rethrow
  throw error;
}

function _buildNetworkMessage(error, aiServiceUrl) {
  const code = error.code || 'UNKNOWN';
  const isRender =
    (process.env.AI_SERVICE_URL || '').includes('render.com') ||
    (process.env.AI_SERVICE_URL || '').includes('onrender.com');

  switch (code) {
    case 'ECONNREFUSED':
      return `Cannot connect to AI service at ${aiServiceUrl}. The service may be down or not accepting connections.`;
    case 'ECONNABORTED':
      return isRender || error.isRenderColdStart
        ? 'AI service is waking up (Render free tier cold start). Please wait 30-60 seconds and try again.'
        : `AI service request timed out. The service may be slow or unresponsive.`;
    case 'ENOTFOUND':
      return `Cannot resolve AI service hostname. Please check that AI_SERVICE_URL (${aiServiceUrl}) is correct.`;
    case 'ETIMEDOUT':
      return `AI service connection timed out. Please check if the service is running at ${aiServiceUrl}.`;
    default:
      return `AI service is unavailable. Showing basic CV insights.`;
  }
}

module.exports = {
  saveAnalysisResult,
  analyzeFromText,
  analyzeFromFile,
  revampCv,
  getCvProfile,
  hasCompleteProfile,
  deleteCvProfile,
};
