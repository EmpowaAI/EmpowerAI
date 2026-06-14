const cvProfileRepository = require('./cvAnalyser.Repository');
const logger = require('../../utils/logger');
const { analyseCVText, analyseCVFile, revampCV } = require('./cvAnalyser.AiService');
const { buildFallbackAnalysis } = require('../../utils/cvFallback.util');
const { extractTextFromUploadedFile } = require('../../utils/cvParser.util');

const MAX_CV_CHARS = 15000;

function cleanCvText(text) {
  return (text || '').replace(/\s+/g, ' ').trim().slice(0, MAX_CV_CHARS);
}

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

// ── Persistence ───────────────────────────────────────────────────────────────
async function _saveAnalysisResult({ userId, file, rawText, analysis, targetRole, industry, isFallback = false }) {
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
    logger.error('[CvService] Failed to save CvProfile', { userId, error: error.message });
    throw error;
  }
}

// ── Analyse from text ─────────────────────────────────────────────────────────
async function analyzeFromText({ userId, cvText, targetRole, industry, jobDescription }) {
  const start = Date.now();

  try {
    logger.info('[CvService] CV text analysis start', { userId, targetRole, industry });

    const safeText = cleanCvText(cvText);

    const aiResult = await callWithRateLimitRetry(() =>
      analyseCVText({ cv_text: safeText, target_role: targetRole, industry, job_description: jobDescription })
    );

    const savedProfile = await _saveAnalysisResult({
      userId,
      file: null,
      rawText: safeText,
      analysis: aiResult.analysis,
      targetRole,
      industry,
      isFallback: false,
    });

    logger.info('[CvService] CV text analysis complete', { userId, duration: Date.now() - start });

    return {
      analysis:  savedProfile.analysis,
      profileId: savedProfile._id,
      isFallback: false,
      cvText:    safeText,
    };
  } catch (error) {
    logger.error('[CvService] CV text analysis failed', { userId, error: error.message });
    return _handleAnalysisError({ error, userId, cvText, targetRole, industry, file: null });
  }
}

// ── Analyse from file ─────────────────────────────────────────────────────────
async function analyzeFromFile({ userId, file, targetRole, industry, jobDescription }) {
  const start = Date.now();

  try {
    logger.info('[CvService] CV file analysis start', { userId, filename: file.originalname, targetRole, industry });

    const aiResult = await callWithRateLimitRetry(() =>
      analyseCVFile({
        fileBuffer:      file.buffer,
        filename:        file.originalname,
        mimetype:        file.mimetype,
        target_role:     targetRole,
        industry,
        job_description: jobDescription,
      })
    );

    const extractedText = aiResult.cv_text || '';

    const savedProfile = await _saveAnalysisResult({
      userId,
      file,
      rawText: extractedText,
      analysis: aiResult.analysis,
      targetRole,
      industry,
      isFallback: false,
    });

    logger.info('[CvService] CV file analysis complete', { userId, duration: Date.now() - start });

    return {
      analysis:  savedProfile.analysis,
      profileId: savedProfile._id,
      isFallback: false,
      cvText:    extractedText,
    };
  } catch (error) {
    logger.error('[CvService] CV file analysis failed', { userId, error: error.message });
    return _handleAnalysisError({ error, userId, cvText: null, targetRole, industry, file });
  }
}

// ── Revamp CV ─────────────────────────────────────────────────────────────────
async function revampCv({ userId, cv_text, analysis, target_role, industry }) {
  let cvText     = cv_text;
  let cvAnalysis = analysis;
  let role       = target_role;
  let ind        = industry;

  // Fall back to stored profile if payload not provided
  if (!cvText || !cvAnalysis) {
    const profile = await cvProfileRepository.findByUserId(userId);
    if (!profile || !profile.isComplete) {
      const err = new Error('Please analyse your CV first before requesting a revamp.');
      err.statusCode = 400;
      throw err;
    }
    cvText     = cvText     || profile.rawText || '';
    cvAnalysis = cvAnalysis || profile.analysis;
    role       = role       || profile.analysis?.targetRole || '';
    ind        = ind        || profile.analysis?.industry   || '';
  }

  if (!cvText) {
    const err = new Error('cv_text is required. Please paste your CV text or analyse via text input first.');
    err.statusCode = 400;
    throw err;
  }

  const start = Date.now();

  try {
    logger.info('[CvService] CV revamp start', { userId, role, ind });

    const aiResult = await callWithRateLimitRetry(() =>
      revampCV({ cv_text: cvText, analysis: cvAnalysis, target_role: role, industry: ind })
    );

    const saved = await cvProfileRepository.saveRevamp({
      userId,
      revampData: aiResult.revamp,
    });

    logger.info('[CvService] CV revamp saved', { userId, profileId: saved._id, duration: Date.now() - start });

    return { revamp: saved.revamp, profileId: saved._id };
  } catch (error) {
    logger.error('[CvService] CV revamp failed', { userId, error: error.message, duration: Date.now() - start });
    throw error;
  }
}

// ── Download revamped CV ──────────────────────────────────────────────────────
async function getRevampForDownload({ userId }) {
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

  logger.info('[CvService] CvProfile restored from cache', { userId, profileId: profile._id });
  return profile;
}

// ── Profile queries ───────────────────────────────────────────────────────────
async function getCvProfile(userId) {
  return cvProfileRepository.findByUserId(userId);
}

async function hasCompleteProfile(userId) {
  return cvProfileRepository.hasCompleteProfile(userId);
}

async function deleteCvProfile(userId) {
  return cvProfileRepository.deleteByUserId(userId);
}

// ── Error handler ─────────────────────────────────────────────────────────────
async function _handleAnalysisError({ error, userId, cvText, targetRole, industry, file }) {
  const status = error.response?.status;

  const isServiceDown =
    status === 503 ||
    status >= 500  ||
    error.code === 'ECONNREFUSED' ||
    error.code === 'ECONNABORTED' ||
    error.code === 'ENOTFOUND'    ||
    error.code === 'ETIMEDOUT'    ||
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
          return await analyzeFromText({ userId, cvText: rawText, targetRole, industry });
        }
      } catch (fallbackError) {
        logger.warn('[CvService] Node-side extraction fallback failed', { userId, error: fallbackError.message });
      }
    }
    throw error;
  }

  if (isServiceDown) {
    let rawText = cvText || '';
    if (!rawText && file) {
      try { rawText = await extractTextFromUploadedFile(file); } catch (_) {}
    }

    const analysis = buildFallbackAnalysis(rawText, []);
    const savedProfile = await _saveAnalysisResult({
      userId, file: file ?? null, rawText, analysis, targetRole, industry, isFallback: true,
    });

    return {
      analysis:       savedProfile.analysis,
      profileId:      savedProfile._id,
      isFallback:     true,
      cvText:         rawText,
      fallbackMessage: 'AI service is temporarily unavailable. Showing basic CV insights.',
    };
  }

  throw error;
}

// ── Exports ───────────────────────────────────────────────────────────────────
module.exports = {
  analyzeFromText,
  analyzeFromFile,
  revampCv,
  getRevampForDownload,
  restoreFromCachedAnalysis,
  getCvProfile,
  hasCompleteProfile,
  deleteCvProfile,
};
