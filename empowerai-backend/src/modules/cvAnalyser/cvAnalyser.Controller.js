/**
 * cvAnalyser.Controller.js
 * HTTP layer only:
 *  - Parse request
 *  - Call service
 *  - Return response
 *  - Forward errors to next()
 */

const cvService = require('./cvAnalyser.Service');
const { AppError, BadRequestError, ServiceUnavailableError } = require('../../utils/errors');

// ─── analyzeCV (text-based) ────────────────────────────────────────────────────

exports.analyzeCV = async (req, res, next) => {
  try {
    const { cvText, jobRequirements } = req.body;

    if (!cvText) {
      return res.status(400).json({ status: 'error', message: 'CV text is required' });
    }

    const jobRequirementsArray = _parseJobRequirements(jobRequirements);

    const { analysis, profileId, isFallback, fallbackMessage, meta } =
      await cvService.analyzeFromText({
        userId: req.user.id,
        cvText,
        jobRequirementsArray,
      });

    return res.status(200).json({
      status: 'success',
      data: {
        analysis,
        profileId,
        ...(isFallback ? { fallback: true, message: fallbackMessage } : {}),
        ...(meta ? { meta } : {}),
      },
    });
  } catch (error) {
    _forwardError(error, next);
  }
};

// ─── analyzeCVFile (file upload) ───────────────────────────────────────────────

exports.analyzeCVFile = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ status: 'error', message: 'CV file is required' });
    }

    const { jobRequirements } = req.body;
    const jobRequirementsArray = _parseJobRequirements(jobRequirements);

    const { analysis, profileId, isFallback, fallbackMessage, meta } =
      await cvService.analyzeFromFile({
        userId: req.user.id,
        file: req.file,
        jobRequirementsArray,
      });

    return res.status(200).json({
      status: 'success',
      data: {
        analysis,
        profileId,
        ...(isFallback ? { fallback: true, message: fallbackMessage } : {}),
        ...(meta ? { meta } : {}),
      },
    });
  } catch (error) {
    _forwardError(error, next);
  }
};

// ─── revampCV ──────────────────────────────────────────────────────────────────

exports.revampCV = async (req, res, next) => {
  try {
    const { cvData } = req.body || {};

    if (!cvData || typeof cvData !== 'object') {
      return res.status(400).json({ status: 'error', message: 'cvData is required' });
    }

    const { revamp, meta } = await cvService.revampCv({ cvData });

    return res.status(200).json({
      status: 'success',
      data: { revamp, ...(meta ? { meta } : {}) },
    });
  } catch (error) {
    _forwardError(error, next);
  }
};

// ─── Stored CV profile (read/delete) ───────────────────────────────────────────

const toBool = (value, defaultValue = false) => {
  if (value === undefined || value === null) return defaultValue;
  const normalized = String(value).trim().toLowerCase();
  if (['1', 'true', 'yes', 'y', 'on'].includes(normalized)) return true;
  if (['0', 'false', 'no', 'n', 'off'].includes(normalized)) return false;
  return defaultValue;
};

exports.getCvProfile = async (req, res, next) => {
  try {
    const includeRawTextRequested = req.query?.includeRawText === '1' || req.query?.includeRawText === 'true';
    const allowRawTextExport = toBool(process.env.CV_ALLOW_RAW_TEXT_EXPORT, false);

    const profile = await cvService.getCvProfile(req.user.id);
    if (!profile) {
      return res.status(200).json({ status: 'success', data: { profile: null } });
    }

    const safeProfile = { ...profile };
    if (!(includeRawTextRequested && allowRawTextExport)) {
      delete safeProfile.rawText;
    }

    return res.status(200).json({ status: 'success', data: { profile: safeProfile } });
  } catch (error) {
    next(error);
  }
};

exports.deleteCvProfile = async (req, res, next) => {
  try {
    await cvService.deleteCvProfile(req.user.id);
    return res.status(200).json({ status: 'success', message: 'CV profile deleted' });
  } catch (error) {
    next(error);
  }
};

// ─── Private helpers ───────────────────────────────────────────────────────────

function _parseJobRequirements(jobRequirements) {
  if (!jobRequirements) return null;
  if (typeof jobRequirements === 'string') {
    return jobRequirements.split(/[,\n]/).map((s) => s.trim()).filter(Boolean);
  }
  if (Array.isArray(jobRequirements)) return jobRequirements;
  return null;
}

function _forwardError(error, next) {
  const status = error.response?.status;
  const message =
    error.response?.data?.message ||
    error.response?.data?.detail ||
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
      Object.assign(new AppError(`AI service is rate limited. Please try again in ${retryAfter} seconds.`, 429), {
        retryAfter,
      })
    );
  }

  if (
    status === 401 ||
    status === 503 ||
    status >= 500 ||
    error.code === 'ECONNREFUSED' ||
    error.code === 'ECONNABORTED' ||
    error.code === 'ENOTFOUND' ||
    error.code === 'ETIMEDOUT'
  ) {
    return next(new ServiceUnavailableError('AI service is temporarily unavailable. Please try again later.'));
  }

  next(error);
}
