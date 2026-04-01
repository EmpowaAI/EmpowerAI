const cvService = require('../services/cvProfile.service');
const cvProfileRepository = require('../repositories/cvProfile.repository');
const { buildBasicAnalysis, parseJobRequirements } = require('../services/cvProfile.service');
const { BadRequestError, ServiceUnavailableError, AppError } = require('../utils/errors');

// ─── HELPERS ──────────────────────────────────────────────

const AI_SERVICE_URL = () => process.env.AI_SERVICE_URL || 'http://localhost:8000';

const handleAiError = (error, fallbackText, jobRequirementsArray, res, next) => {
  const errorMessage = error.message || '';
  const isRateLimit =
    error.isRateLimit ||
    error?.response?.status === 429 ||
    errorMessage.toLowerCase().includes('rate limit');

  if (isRateLimit) {
    const retryAfter = error.retryAfter || error.response?.data?.retryAfter || 60;
    return res.status(200).json({
      status: 'success',
      data: {
        analysis: buildBasicAnalysis(fallbackText, jobRequirementsArray),
        fallback: true,
        message: `AI service is rate limited. Showing basic CV insights while you wait ${retryAfter} seconds.`,
      },
    });
  }

  if (error.response) {
    const status = error.response.status;
    const message =
      error.response.data?.message ||
      error.response.data?.detail ||
      error.message ||
      'Failed to analyze CV';

    if (status === 400) return next(new BadRequestError(message));

    if (status === 503) {
      return res.status(200).json({
        status: 'success',
        data: {
          analysis: buildBasicAnalysis(fallbackText, jobRequirementsArray),
          fallback: true,
          message: 'AI service is temporarily unavailable. Showing basic CV insights.',
        },
      });
    }

    if (status >= 500) {
      return next(new ServiceUnavailableError('AI service is temporarily unavailable. Please try again later.'));
    }

    return next(new AppError(message, status));
  }

  // Network errors
  if (!error.response) {
    const code = error.code || 'UNKNOWN';
    const url = AI_SERVICE_URL();
    const messages = {
      ECONNREFUSED: `Cannot connect to AI service at ${url}. The service may be down.`,
      ECONNABORTED:
        url.includes('render.com') || url.includes('onrender.com') || error.isRenderColdStart
          ? 'AI service is waking up (Render cold start). Please wait 30–60 seconds and try again.'
          : 'AI service request timed out.',
      ENOTFOUND: `Cannot resolve AI service hostname. Check AI_SERVICE_URL (${url}).`,
      ETIMEDOUT: `AI service connection timed out at ${url}.`,
    };

    return res.status(200).json({
      status: 'success',
      data: {
        analysis: buildBasicAnalysis(fallbackText, jobRequirementsArray),
        fallback: true,
        message: messages[code] || `AI service unavailable (${code}). Check ${url}.`,
      },
    });
  }

  next(error);
};

// ─── GET CV PROFILE ───────────────────────────────────────

exports.getCvProfile = async (req, res, next) => {
  try {
    const profile = await cvProfileRepository.findByUserId(req.user.id);
    return res.status(200).json({
      status: 'success',
      data: { profile: profile || null },
    });
  } catch (error) {
    next(error);
  }
};

// ─── ANALYZE CV (TEXT) ────────────────────────────────────

exports.analyzeCV = async (req, res, next) => {
  const { cvText, jobRequirements } = req.body;
  const jobRequirementsArray = parseJobRequirements(jobRequirements);

  try {
    const { analysis, meta } = await cvService.analyzeCV(
      req.user?.id,
      cvText,
      jobRequirements
    );
    return res.status(200).json({
      status: 'success',
      data: { analysis, ...(meta ? { meta } : {}) },
    });
  } catch (error) {
    if (error.isOperational) return next(error);
    return handleAiError(error, cvText, jobRequirementsArray, res, next);
  }
};

// ─── ANALYZE CV (FILE) ────────────────────────────────────

exports.analyzeCVFile = async (req, res, next) => {
  const { jobRequirements } = req.body;
  const file = req.file;
  const jobRequirementsArray = parseJobRequirements(jobRequirements);

  const fallbackText =
    file?.mimetype === 'text/plain' || file?.originalname?.toLowerCase().endsWith('.txt')
      ? file.buffer.toString('utf8')
      : '';

  try {
    const { analysis, meta } = await cvService.analyzeCVFile(
      req.user?.id,
      file,
      jobRequirements
    );
    return res.status(200).json({
      status: 'success',
      data: { analysis, ...(meta ? { meta } : {}) },
    });
  } catch (error) {
    if (error.isOperational) return next(error);
    return handleAiError(error, fallbackText, jobRequirementsArray, res, next);
  }
};

// ─── REVAMP CV ────────────────────────────────────────────

exports.revampCV = async (req, res, next) => {
  const { cvData } = req.body || {};

  try {
    const { revamp, meta } = await cvService.revampCV(cvData);
    return res.status(200).json({
      status: 'success',
      data: { revamp, ...(meta ? { meta } : {}) },
    });
  } catch (error) {
    if (error.isOperational) return next(error);

    const errorMessage = error.message || '';
    if (error.isRateLimit || errorMessage.toLowerCase().includes('rate limit')) {
      return res.status(429).json({
        status: 'error',
        message: `AI service is rate limited. Please try again in ${error.retryAfter || 60} seconds.`,
        retryAfter: error.retryAfter || 60,
      });
    }

    if (error.response?.status === 503 || error.code === 'ECONNABORTED') {
      return next(new ServiceUnavailableError('AI service is temporarily unavailable.'));
    }

    next(error);
  }
};
