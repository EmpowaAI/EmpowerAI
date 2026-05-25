const cvService = require('./cvAnalyser.Service');
const { AppError, BadRequestError, ServiceUnavailableError } = require('../../utils/errors');
const { buildCVDocx } = require('../../intergration/docxBuilder/cvDoxcBuilder');

// ── Restore from cached analysis ──────────────────────────────────────────────
exports.restoreFromCachedAnalysis = async (req, res, next) => {
  try {
    const { analysis } = req.body;
    if (!analysis || typeof analysis !== 'object') {
      return res.status(400).json({ status: 'error', message: 'analysis object is required' });
    }
    const profile = await cvService.restoreFromCachedAnalysis({
      userId: req.user.id,
      cachedAnalysis: analysis,
    });
    return res.status(200).json({ status: 'success', data: { profileId: profile._id } });
  } catch (error) {
    next(error);
  }
};

// ── Analyse from text ─────────────────────────────────────────────────────────
exports.analyzeCV = async (req, res, next) => {
  try {
    const { cvText, targetRole, industry, jobDescription } = req.body;

    if (!cvText) {
      return res.status(400).json({ status: 'error', message: 'cvText is required' });
    }
    if (!targetRole || !industry) {
      return res.status(400).json({ status: 'error', message: 'targetRole and industry are required' });
    }

    const { analysis, profileId, isFallback, fallbackMessage, isSubscribed, remaining } =
      await cvService.analyzeFromText({
        userId:          req.user.id,
        cvText,
        targetRole,
        industry,
        jobDescription:  req.body.jobDescription || null,
        subscription:    req.subscription || null,
      });

    return res.status(200).json({
      status: 'success',
      data: {
        analysis,
        profileId,
        isSubscribed,
        ...(remaining !== null ? { analysisRemaining: remaining } : {}),
        ...(isFallback ? { fallback: true, message: fallbackMessage } : {}),
      },
    });
  } catch (error) {
    if (error.limitReached) {
      return res.status(403).json({ status: 'error', message: error.message, limitReached: true });
    }
    _forwardError(error, next);
  }
};

// ── Analyse from file ─────────────────────────────────────────────────────────
exports.analyzeCVFile = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ status: 'error', message: 'CV file is required' });
    }

    const { targetRole, industry, jobDescription } = req.body;
    if (!targetRole || !industry) {
      return res.status(400).json({ status: 'error', message: 'targetRole and industry are required' });
    }

    const { analysis, profileId, isFallback, fallbackMessage, isSubscribed, remaining } =
      await cvService.analyzeFromFile({
        userId:       req.user.id,
        file:         req.file,
        targetRole,
        industry,
        jobDescription: jobDescription || null,
        subscription:   req.subscription || null,
      });

    return res.status(200).json({
      status: 'success',
      data: {
        analysis,
        profileId,
        isSubscribed,
        ...(remaining !== null ? { analysisRemaining: remaining } : {}),
        ...(isFallback ? { fallback: true, message: fallbackMessage } : {}),
      },
    });
  } catch (error) {
    if (error.limitReached) {
      return res.status(403).json({ status: 'error', message: error.message, limitReached: true });
    }
    _forwardError(error, next);
  }
};

// ── Revamp CV (subscription only) ────────────────────────────────────────────
exports.revampCV = async (req, res, next) => {
  try {
    const cv_text    = req.body.cv_text || req.body.cvText || null;
    const analysis   = req.body.analysis || null;
    const target_role = req.body.target_role || req.body.targetRole || null;
    const industry   = req.body.industry || null;

    const { revamp, profileId } = await cvService.revampCv({
      userId: req.user.id,
      cv_text,
      analysis,
      target_role,
      industry,
    });

    return res.status(200).json({
      status: 'success',
      data: { revamp, profileId },
    });
  } catch (error) {
    _forwardError(error, next);
  }
};

// ── Download revamped CV as DOCX (subscription only) ─────────────────────────
exports.downloadRevampedCV = async (req, res, next) => {
  try {
    const { format = 'docx' } = req.query;

    const { revampedCv, plainTextCv } = await cvService.getRevampForDownload({
      userId:       req.user.id,
      subscription: req.subscription || null,
    });

    // Plain text download
    if (format === 'txt') {
      const filename = `revamped-cv-${req.user.id}.txt`;
      res.setHeader('Content-Type', 'text/plain');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      return res.send(plainTextCv || '');
    }

    // DOCX download (default)
    const docxBuffer = await buildCVDocx(revampedCv);
    const filename = `revamped-cv-${req.user.id}.docx`;

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    );
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', docxBuffer.length);

    return res.send(docxBuffer);
  } catch (error) {
    if (error.requiresSubscription) {
      return res.status(403).json({
        status: 'error',
        message: error.message,
        requiresSubscription: true,
      });
    }
    _forwardError(error, next);
  }
};

// ── Get CV profile ────────────────────────────────────────────────────────────
exports.getCvProfile = async (req, res, next) => {
  try {
    const includeRawText = req.query?.includeRawText === '1';
    const allowRawExport = process.env.CV_ALLOW_RAW_TEXT_EXPORT === 'true';

    const profile = await cvService.getCvProfile(req.user.id, req.subscription || null);
    if (!profile) {
      return res.status(200).json({ status: 'success', data: { profile: null } });
    }

    const safeProfile = { ...profile };
    if (!(includeRawText && allowRawExport)) delete safeProfile.rawText;

    return res.status(200).json({ status: 'success', data: { profile: safeProfile } });
  } catch (error) {
    next(error);
  }
};

// ── Delete CV profile ─────────────────────────────────────────────────────────
exports.deleteCvProfile = async (req, res, next) => {
  try {
    await cvService.deleteCvProfile(req.user.id);
    return res.status(200).json({ status: 'success', message: 'CV profile deleted' });
  } catch (error) {
    next(error);
  }
};

// ── Error forwarding ──────────────────────────────────────────────────────────
function _forwardError(error, next) {
  const status = error.response?.status;
  const message =
    error.response?.data?.detail ||
    error.response?.data?.message ||
    error.message ||
    'An unexpected error occurred';

  if (error instanceof BadRequestError || status === 400) {
    return next(new BadRequestError(message));
  }
  if (
    error.isRateLimit ||
    status === 429 ||
    (error.message || '').toLowerCase().includes('rate limit')
  ) {
    const retryAfter = error.retryAfter || 60;
    return next(
      Object.assign(
        new AppError(`AI service is rate limited. Please try again in ${retryAfter} seconds.`, 429),
        { retryAfter }
      )
    );
  }
  if (
    status === 503 ||
    status >= 500 ||
    error.code === 'ECONNREFUSED' ||
    error.code === 'ECONNABORTED' ||
    error.code === 'ENOTFOUND' ||
    error.code === 'ETIMEDOUT'
  ) {
    return next(new ServiceUnavailableError('AI service is temporarily unavailable.'));
  }
  next(error);
}
