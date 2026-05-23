const cvProfileRepository = require('./cvAnalyser.Repository');
const logger = require('../../utils/logger');
const { analyseCVText, analyseCVFile, revampCV } = require('./cvAnalyser.AiService');
const { buildFallbackAnalysis } = require('../../utils/cvFallback.util');
const { extractTextFromUploadedFile } = require('../../utils/cvParser.util');
const AiUsageLog = require('../usage/usage.model');
const { getPlanById } = require('../../config/plans.config');

const FREE_ANALYSIS_LIMIT = 3;

// Subscription-gated fields — stripped from response for non-subscribers
const GATED_FIELDS = [
  'salaryPrediction',
  'careerRoadmap',
  'provinceEarnings',
  'marketBenchmarking',
  'careerSimulation',
  'interviewQuestions',
  'linkedinSummary',
  'coverLetter',
  'careerRecommendations',
];

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

// ── AI usage audit ────────────────────────────────────────────────────────────
async function _logAiUsage({ userId, feature, latencyMs, isError, errorMessage }) {
  try {
    await AiUsageLog.create({
      userId,
      feature,
      latencyMs,
      isError: !!isError,
      errorMessage: errorMessage || null,
      modelUsed: process.env.AI_MODEL || null,
    });
  } catch (err) {
    logger.warn('[CvService] Failed to write AI usage log', { userId, err: err.message });
  }
}

// ── Subscription helpers ──────────────────────────────────────────────────────

/**
 * Checks if user has an active paid/trial subscription.
 * Expects req.subscription to be set by auth middleware.
 */
function _isSubscribed(subscription) {
  if (!subscription) return false;
  return subscription.isActive === true;
}

/**
 * Strips gated fields from analysis for non-subscribed users.
 */
function _applySubscriptionGate(analysis, isSubscribed) {
  if (!analysis || isSubscribed) return analysis;
  const gated = { ...analysis };
  GATED_FIELDS.forEach((field) => {
    gated[field] = undefined;
  });
  return gated;
}

// ── Analysis limit check (free users: max 3) ──────────────────────────────────
async function checkAnalysisLimit(userId, subscription) {
  if (_isSubscribed(subscription)) return { allowed: true };

  const count = await cvProfileRepository.getAnalysisCount(userId);
  if (count >= FREE_ANALYSIS_LIMIT) {
    return {
      allowed: false,
      message: `Free users can analyse their CV up to ${FREE_ANALYSIS_LIMIT} times. Subscribe to unlock unlimited analysis.`,
      count,
      limit: FREE_ANALYSIS_LIMIT,
    };
  }

  return { allowed: true, count, remaining: FREE_ANALYSIS_LIMIT - count };
}

// ── Persistence ───────────────────────────────────────────────────────────────
async function _saveAnalysisResult({
  userId,
  file,
  rawText,
  analysis,
  targetRole,
  industry,
  isFallback = false,
}) {
  try {
    const profile = await cvProfileRepository.saveOrUpdate({
      userId,
      filename:  file?.originalname ?? null,
      mimetype:  file?.mimetype     ?? null,
      fileSize:  file?.size         ?? null,
      rawText,
      analysis,
      targetRole,
      industry,
      isFallback,
    });

    logger.info('[CvService] CvProfile saved', {
      userId,
      profileId:  profile._id,
      atsScore:   profile.analysis?.atsScore,
      isFallback,
      isComplete: profile.isComplete,
    });

    return profile;
  } catch (error) {
    logger.error('[CvService] Failed to save CvProfile', {
      userId,
      error: error.message,
    });
    throw error;
  }
}

// ── Analyse from text ─────────────────────────────────────────────────────────
async function analyzeFromText({ userId, cvText, targetRole, industry, jobDescription, subscription }) {
  const limitCheck = await checkAnalysisLimit(userId, subscription);
  if (!limitCheck.allowed) {
    const err = new Error(limitCheck.message);
    err.statusCode = 403;
    err.limitReached = true;
    throw err;
  }

  const start = Date.now();
  try {
    logger.info('[CvService] CV text analysis start', { userId, targetRole, industry });

    const aiResult = await callWithRateLimitRetry(() =>
      analyseCVText({ cv_text: cvText, target_role: targetRole, industry, job_description: jobDescription })
    );

    await _logAiUsage({
      userId,
      feature: 'cv_analysis',
      latencyMs: Date.now() - start,
      isError: false,
    });

    const savedProfile = await _saveAnalysisResult({
      userId,
      file: null,
      rawText: cvText,
      analysis: aiResult.analysis,
      targetRole,
      industry,
      isFallback: false,
    });

    const gatedAnalysis = _applySubscriptionGate(
      savedProfile.analysis,
      _isSubscribed(subscription)
    );

    return {
      analysis: gatedAnalysis,
      profileId: savedProfile._id,
      isFallback: false,
      isSubscribed: _isSubscribed(subscription),
      remaining: limitCheck.remaining ?? null,
    };
  } catch (error) {
    if (error.limitReached) throw error;

    await _logAiUsage({
      userId,
      feature: 'cv_analysis',
      latencyMs: Date.now() - start,
      isError: true,
      errorMessage: error.message,
    });

    return _handleAnalysisError({ error, userId, cvText, targetRole, industry, file: null, subscription });
  }
}

// ── Analyse from file ─────────────────────────────────────────────────────────
async function analyzeFromFile({ userId, file, targetRole, industry, jobDescription, subscription }) {
  const limitCheck = await checkAnalysisLimit(userId, subscription);
  if (!limitCheck.allowed) {
    const err = new Error(limitCheck.message);
    err.statusCode = 403;
    err.limitReached = true;
    throw err;
  }

  const start = Date.now();
  try {
    logger.info('[CvService] CV file analysis start', {
      userId,
      filename: file.originalname,
      targetRole,
      industry,
    });

    const aiResult = await callWithRateLimitRetry(() =>
      analyseCVFile({
        fileBuffer: file.buffer,
        filename:   file.originalname,
        mimetype:   file.mimetype,
        target_role: targetRole,
        industry,
        job_description: jobDescription,
      })
    );

    await _logAiUsage({
      userId,
      feature: 'cv_analysis',
      latencyMs: Date.now() - start,
      isError: false,
    });

    const savedProfile = await _saveAnalysisResult({
      userId,
      file,
      rawText: '',
      analysis: aiResult.analysis,
      targetRole,
      industry,
      isFallback: false,
    });

    const gatedAnalysis = _applySubscriptionGate(
      savedProfile.analysis,
      _isSubscribed(subscription)
    );

    return {
      analysis: gatedAnalysis,
      profileId: savedProfile._id,
      isFallback: false,
      isSubscribed: _isSubscribed(subscription),
      remaining: limitCheck.remaining ?? null,
    };
  } catch (error) {
    if (error.limitReached) throw error;

    await _logAiUsage({
      userId,
      feature: 'cv_analysis',
      latencyMs: Date.now() - start,
      isError: true,
      errorMessage: error.message,
    });

    return _handleAnalysisError({ error, userId, cvText: null, targetRole, industry, file, subscription });
  }
}

// ── Revamp CV (subscription only) ────────────────────────────────────────────
async function revampCv({ userId, subscription }) {
  if (!_isSubscribed(subscription)) {
    const err = new Error('CV Revamp is available for subscribed users only. Please upgrade your plan.');
    err.statusCode = 403;
    err.requiresSubscription = true;
    throw err;
  }

  // Load the stored profile to get cv_text and analysis
  const profile = await cvProfileRepository.findByUserId(userId);
  if (!profile || !profile.isComplete) {
    const err = new Error('Please analyse your CV first before requesting a revamp.');
    err.statusCode = 400;
    throw err;
  }

  const start = Date.now();
  try {
    logger.info('[CvService] CV revamp start', { userId });

    const aiResult = await callWithRateLimitRetry(() =>
      revampCV({
        cv_text:     profile.rawText || '',
        analysis:    profile.analysis,
        target_role: profile.analysis?.targetRole || '',
        industry:    profile.analysis?.industry   || '',
      })
    );

    await _logAiUsage({
      userId,
      feature: 'cv_analysis', // reuse existing enum — extend if needed
      latencyMs: Date.now() - start,
      isError: false,
    });

    const savedProfile = await cvProfileRepository.saveRevamp({
      userId,
      revampData: aiResult.revamp,
    });

    logger.info('[CvService] CV revamp saved', { userId, profileId: savedProfile._id });

    return {
      revamp: savedProfile.revamp,
      profileId: savedProfile._id,
    };
  } catch (error) {
    if (error.statusCode) throw error;

    await _logAiUsage({
      userId,
      feature: 'cv_analysis',
      latencyMs: Date.now() - start,
      isError: true,
      errorMessage: error.message,
    });

    throw error;
  }
}

// ── Download revamped CV (subscription only) ──────────────────────────────────
async function getRevampForDownload({ userId, subscription }) {
  if (!_isSubscribed(subscription)) {
    const err = new Error('CV download is available for subscribed users only. Please upgrade your plan.');
    err.statusCode = 403;
    err.requiresSubscription = true;
    throw err;
  }

  const profile = await cvProfileRepository.findByUserId(userId);
  if (!profile?.revamp?.revampedCv) {
    const err = new Error('No revamped CV found. Please revamp your CV first.');
    err.statusCode = 404;
    throw err;
  }

  return {
    revampedCv:    profile.revamp.revampedCv,
    plainTextCv:   profile.revamp.plainTextCv,
    revampSummary: profile.revamp.revampSummary,
    revampedAt:    profile.revamp.revampedAt,
  };
}

// ── Restore from cached analysis ──────────────────────────────────────────────
async function restoreFromCachedAnalysis({ userId, cachedAnalysis }) {
  const profile = await cvProfileRepository.saveOrUpdate({
    userId,
    filename:   null,
    mimetype:   null,
    fileSize:   null,
    rawText:    '',
    analysis:   cachedAnalysis,
    targetRole: cachedAnalysis.targetRole || '',
    industry:   cachedAnalysis.industry   || 'general',
    isFallback: false,
  });

  logger.info('[CvService] CvProfile restored from cache', {
    userId,
    profileId: profile._id,
  });

  return profile;
}

// ── Profile queries ───────────────────────────────────────────────────────────
async function getCvProfile(userId, subscription) {
  const profile = await cvProfileRepository.findByUserId(userId);
  if (!profile) return null;

  // Gate subscription fields on read too
  if (profile.analysis) {
    profile.analysis = _applySubscriptionGate(
      profile.analysis,
      _isSubscribed(subscription)
    );
  }

  return profile;
}

async function hasCompleteProfile(userId) {
  return cvProfileRepository.hasCompleteProfile(userId);
}

async function deleteCvProfile(userId) {
  return cvProfileRepository.deleteByUserId(userId);
}

// ── Error handler ─────────────────────────────────────────────────────────────
async function _handleAnalysisError({ error, userId, cvText, targetRole, industry, file, subscription }) {
  const status = error.response?.status;

  const isRateLimit =
    error.isRateLimit ||
    status === 429 ||
    (error.message || '').toLowerCase().includes('rate limit');

  const isServiceDown =
    status === 503 ||
    status >= 500 ||
    error.code === 'ECONNREFUSED' ||
    error.code === 'ECONNABORTED' ||
    error.code === 'ENOTFOUND' ||
    error.code === 'ETIMEDOUT' ||
    !error.response;

  // 400 — bad input; try Node-side extraction if file provided
  if (status === 400) {
    const detail = error.response?.data?.detail || error.response?.data?.message || '';
    const isNotCv = detail.toLowerCase().includes('invalid document format');

    if (!isNotCv && file) {
      try {
        const rawText = await extractTextFromUploadedFile(file);
        if (rawText && rawText.trim().length > 50) {
          logger.info('[CvService] Retrying with Node-side text extraction', { userId });
          return await analyzeFromText({ userId, cvText: rawText, targetRole, industry, subscription });
        }
      } catch (fallbackError) {
        logger.warn('[CvService] Node-side extraction fallback failed', {
          userId,
          error: fallbackError.message,
        });
      }
    }
    throw error;
  }

  if (isRateLimit || isServiceDown) {
    let rawText = cvText || '';
    if (!rawText && file) {
      try { rawText = await extractTextFromUploadedFile(file); } catch (_) {}
    }

    const analysis = buildFallbackAnalysis(rawText, []);
    const savedProfile = await _saveAnalysisResult({
      userId,
      file: file ?? null,
      rawText,
      analysis,
      targetRole,
      industry,
      isFallback: true,
    });

    const fallbackMessage = isRateLimit
      ? 'AI service is rate limited. Showing basic CV insights.'
      : 'AI service is temporarily unavailable. Showing basic CV insights.';

    return {
      analysis: analysis,
      profileId: savedProfile?._id ?? null,
      isFallback: true,
      fallbackMessage,
      isSubscribed: _isSubscribed(subscription),
    };
  }

  throw error;
}

module.exports = {
  analyzeFromText,
  analyzeFromFile,
  revampCv,
  getRevampForDownload,
  restoreFromCachedAnalysis,
  getCvProfile,
  hasCompleteProfile,
  deleteCvProfile,
  checkAnalysisLimit,
};
