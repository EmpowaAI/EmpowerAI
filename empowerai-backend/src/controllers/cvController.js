const aiServiceClient = require('../services/aiServiceClient');
const cvService = require('../services/cvService');
const { AppError, BadRequestError, ServiceUnavailableError } = require('../utils/errors');
const FormData = require('form-data');
const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');
const { runAiTask } = require('../queues/aiQueue');
const { extractSkillsEnhanced } = require('../utils/skillExtractors');

// Request timeout constant (matches aiServiceClient timeout)
const REQUEST_TIMEOUT = 30000; // 30 seconds

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// ─── Helpers ────────────────────────────────────────────────────────────────

const buildBasicAnalysis = (cvText, jobRequirementsArray) => {
  const text = (cvText || '').toString();
  const extractedSkills = extractSkillsEnhanced(text);

  const missingSkills = Array.isArray(jobRequirementsArray)
    ? jobRequirementsArray.filter(
        (req) => !extractedSkills.some((skill) => skill.toLowerCase().includes(req.toLowerCase()))
      )
    : [];

  const suggestions = [];
  const trimmed = text.trim();
  const hasReadableText = trimmed.length >= 50;

  if (extractedSkills.length === 0) {
    suggestions.push(
      hasReadableText
        ? 'Add more detail about your skills and tools to improve matching.'
        : 'We could not extract readable text from this file (it may be scanned/image-based). Try uploading a DOCX/text PDF or run OCR, or paste your CV text.'
    );
  }

  if (missingSkills.length > 0) {
    suggestions.push(
      'Consider adding evidence for these requirements: ' + missingSkills.slice(0, 5).join(', ')
    );
  }

  suggestions.push('Include measurable outcomes (numbers, projects, and results) to strengthen your CV.');

  let score = 0;
  if (hasReadableText) {
    score += Math.min(extractedSkills.length * 2, 30);
    score += trimmed.length >= 1200 ? 20 : trimmed.length >= 600 ? 12 : 6;
    if (missingSkills.length > 0) score = Math.max(10, score - Math.min(missingSkills.length * 2, 10));
    score = Math.min(score, 100);
  }

  const readinessLevel =
    score >= 85 ? 'EXCEPTIONAL' :
    score >= 75 ? 'HIGH POTENTIAL' :
    score >= 60 ? 'GOOD' :
    score >= 45 ? 'DEVELOPING' :
    'JUNIOR';

  const strengths =
    extractedSkills.length > 0
      ? [`Identified key skills: ${extractedSkills.slice(0, 6).join(', ')}`]
      : hasReadableText
      ? ['CV text extracted successfully']
      : [];

  const weaknesses = !hasReadableText
    ? ['File appears to have no selectable text (scanned/image-based). Use OCR or upload DOCX/text PDF.']
    : extractedSkills.length === 0
    ? ['No clear skills detected from the extracted text — add a dedicated skills section.']
    : [];

  return {
    extractedSkills,
    missingSkills,
    suggestions,
    marketKeywords: [],
    about:
      extractedSkills.length > 0
        ? `Professional with experience in ${extractedSkills.slice(0, 6).join(', ')}.`
        : 'Motivated professional seeking new opportunities.',
    education: [],
    experience: [],
    achievements: [],
    cvText: trimmed.slice(0, 2000),
    links: { linkedin: false, github: false, portfolio: false, driversLicence: false },
    score,
    readinessLevel,
    strengths,
    weaknesses,
    recommendations: suggestions,
    missingKeywords: missingSkills,
    industry: 'general',
    summary:
      extractedSkills.length > 0
        ? `Candidate with ${extractedSkills.length} detected skills.`
        : hasReadableText
        ? 'Candidate profile extracted from CV text.'
        : 'Unable to extract readable text from uploaded file.',
    analysisSource: 'fallback',
  };
};

const extractTextFromUploadedFile = async (file) => {
  if (!file || !file.buffer) return '';
  const filename = (file.originalname || '').toLowerCase();
  const mimetype = (file.mimetype || '').toLowerCase();

  if (mimetype === 'text/plain' || filename.endsWith('.txt')) {
    return file.buffer.toString('utf8');
  }

  if (mimetype === 'application/pdf' || filename.endsWith('.pdf')) {
    const pdfParse = require('pdf-parse');
    const parsed = await pdfParse(file.buffer);
    return (parsed?.text || '').trim();
  }

  if (
    mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    filename.endsWith('.docx')
  ) {
    const mammoth = require('mammoth');
    const result = await mammoth.extractRawText({ buffer: file.buffer });
    return (result?.value || '').trim();
  }

  return '';
};

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

// ─── analyzeCV (text-based) ─────────────────────────────────────────────────

exports.analyzeCV = async (req, res, next) => {
  let cvText = null;
  let jobRequirementsArray = null;

  try {
    const { cvText: cvTextInput, jobRequirements } = req.body;
    cvText = cvTextInput;

    if (!cvText) {
      return res.status(400).json({ status: 'error', message: 'CV text is required' });
    }

    if (jobRequirements) {
      if (typeof jobRequirements === 'string') {
        jobRequirementsArray = jobRequirements.split(/[,\n]/).map((s) => s.trim()).filter(Boolean);
      } else if (Array.isArray(jobRequirements)) {
        jobRequirementsArray = jobRequirements;
      }
    }

    const aiServiceUrl = process.env.AI_SERVICE_URL || 'http://localhost:8000';
    console.log('[CV Controller] Calling AI service for CV analysis...', {
      aiServiceUrl,
      endpoint: '/cv/analyze',
      fullUrl: `${aiServiceUrl}/api/cv/analyze`,
    });

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

    console.log('[CV Controller] AI service response received successfully');

    // Save to CvProfile
    const savedProfile = await cvService.saveAnalysisResult({
      userId: req.user.id,
      file: null,
      rawText: cvText,
      analysis,
      isFallback: false,
    });

    return res.status(200).json({
      status: 'success',
      data: {
        analysis,
        profileId: savedProfile?._id ?? null,
        ...(meta ? { meta } : {}),
      },
    });
  } catch (error) {
    console.error('[CV Controller] Error analyzing CV:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      code: error.code,
    });

    const errorMessage = error.message || '';

    // Rate limit fallback
    if (error.isRateLimit || errorMessage.toLowerCase().includes('rate limit')) {
      const retryAfter = error.retryAfter || 60;
      const analysis = buildBasicAnalysis(cvText, jobRequirementsArray);
      await cvService.saveAnalysisResult({ userId: req.user.id, file: null, rawText: cvText, analysis, isFallback: true });
      return res.status(200).json({
        status: 'success',
        data: {
          analysis,
          fallback: true,
          message: `AI service is rate limited. Showing basic CV insights while you wait ${retryAfter} seconds.`,
        },
      });
    }

    if (error.response) {
      const status = error.response.status;
      const data = error.response.data;
      const message = data?.message || data?.detail || error.message || 'Failed to analyze CV';

      if (status === 400) return next(new BadRequestError(message));

      if (status === 429 || status === 503) {
        const analysis = buildBasicAnalysis(cvText, jobRequirementsArray);
        await cvService.saveAnalysisResult({ userId: req.user.id, file: null, rawText: cvText, analysis, isFallback: true });
        return res.status(200).json({
          status: 'success',
          data: { analysis, fallback: true, message: 'AI service is temporarily unavailable. Showing basic CV insights.' },
        });
      }

      if (status >= 500) return next(new ServiceUnavailableError('AI service is temporarily unavailable. Please try again later.'));

      return next(new AppError(message, status));
    }

    // Network errors
    if (!error.response) {
      const aiServiceUrl = process.env.AI_SERVICE_URL || 'http://localhost:8000';
      const errorCode = error.code || error.errno || 'UNKNOWN';

      console.error('[CV Controller] Network error details:', {
        code: errorCode,
        message: error.message,
        config: { url: error.config?.url, method: error.config?.method, baseURL: error.config?.baseURL, timeout: error.config?.timeout },
      });

      let errorMsg;
      switch (errorCode) {
        case 'ECONNREFUSED':
          errorMsg = `Cannot connect to AI service at ${aiServiceUrl}. The service may be down or not accepting connections.`;
          break;
        case 'ECONNABORTED': {
          const isRender = (process.env.AI_SERVICE_URL || '').includes('render.com') || (process.env.AI_SERVICE_URL || '').includes('onrender.com');
          errorMsg = isRender || error.isRenderColdStart
            ? 'AI service is waking up (Render free tier cold start). Please wait 30-60 seconds and try again.'
            : `AI service request timed out after ${REQUEST_TIMEOUT}ms. The service may be slow or unresponsive.`;
          break;
        }
        case 'ENOTFOUND':
          errorMsg = `Cannot resolve AI service hostname. Please check that AI_SERVICE_URL (${aiServiceUrl}) is correct.`;
          break;
        case 'ETIMEDOUT':
          errorMsg = `AI service connection timed out. Please check if the service is running at ${aiServiceUrl}.`;
          break;
        default:
          errorMsg = `AI service is unavailable (${errorCode}: ${error.message}). Please check if the service is running at ${aiServiceUrl}.`;
      }

      const analysis = buildBasicAnalysis(cvText, jobRequirementsArray);
      await cvService.saveAnalysisResult({ userId: req.user.id, file: null, rawText: cvText, analysis, isFallback: true });
      return res.status(200).json({ status: 'success', data: { analysis, fallback: true, message: errorMsg } });
    }

    next(error);
  }
};

// ─── analyzeCVFile (file upload) ─────────────────────────────────────────────

exports.analyzeCVFile = async (req, res, next) => {
  let file = null;
  let jobRequirementsArray = null;

  try {
    if (!req.file) {
      return res.status(400).json({ status: 'error', message: 'CV file is required' });
    }

    const { jobRequirements } = req.body;
    file = req.file;

    if (jobRequirements) {
      if (typeof jobRequirements === 'string') {
        jobRequirementsArray = jobRequirements.split(/[,\n]/).map((s) => s.trim()).filter(Boolean);
      } else if (Array.isArray(jobRequirements)) {
        jobRequirementsArray = jobRequirements;
      }
    }

    console.log('[CV Controller] Calling AI service for CV file analysis...', {
      filename: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
    });

    const aiServiceUrl = process.env.AI_SERVICE_URL || 'http://localhost:8000';
    const aiServiceApiKey = process.env.AI_SERVICE_API_KEY;

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
            timeout: 60000,
            maxContentLength: 10 * 1024 * 1024,
            maxBodyLength: 10 * 1024 * 1024,
          })
        ).then((response) => response.data);
      },
      { timeout: 60000, includeJobId: true }
    );

    const analysis = queuedResult.result || queuedResult;
    const meta = queuedResult.result
      ? { jobId: queuedResult.jobId, queued: queuedResult.queued }
      : undefined;

    console.log('[CV Controller] AI service response received successfully');

    // Save to CvProfile
    const savedProfile = await cvService.saveAnalysisResult({
      userId: req.user.id,
      file,
      rawText: '',
      analysis,
      isFallback: false,
    });

    return res.status(200).json({
      status: 'success',
      data: {
        analysis,
        profileId: savedProfile?._id ?? null,
        ...(meta ? { meta } : {}),
      },
    });
  } catch (error) {
    console.error('[CV Controller] Error analyzing CV file:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      code: error.code,
    });

    const errorMessage = error.message || '';

    // Rate limit fallback
    const isOpenAIRateLimit =
      error.response?.status === 429 &&
      (errorMessage.toLowerCase().includes('openai') || errorMessage.toLowerCase().includes('rate limit'));

    if (error.isRateLimit || isOpenAIRateLimit || errorMessage.toLowerCase().includes('rate limit')) {
      const retryAfter = error.retryAfter || error.response?.data?.retryAfter || 60;
      let cvTextFallback = '';
      try { cvTextFallback = await extractTextFromUploadedFile(file); } catch (e) {}
      const analysis = buildBasicAnalysis(cvTextFallback, jobRequirementsArray);
      await cvService.saveAnalysisResult({ userId: req.user.id, file, rawText: cvTextFallback, analysis, isFallback: true });
      return res.status(200).json({
        status: 'success',
        data: {
          analysis,
          fallback: true,
          message: `AI service is rate limited. Showing basic CV insights while you wait ${retryAfter} seconds.`,
          source: isOpenAIRateLimit ? 'openai' : 'backend',
        },
      });
    }

    // Invalid file type
    if (error.message && error.message.includes('Invalid file type')) {
      return next(new BadRequestError(error.message));
    }

    // AI service HTTP errors
    if (error.response) {
      const status = error.response.status;
      const data = error.response.data;
      const message = data?.message || data?.detail || error.message || 'Failed to analyze CV file';

      if (status === 400) return next(new BadRequestError(message));

      if (status === 401 || status === 429 || status === 503 || status >= 500) {
        let cvTextFallback = '';
        try { cvTextFallback = await extractTextFromUploadedFile(file); } catch (e) {}
        const analysis = buildBasicAnalysis(cvTextFallback, jobRequirementsArray);
        await cvService.saveAnalysisResult({ userId: req.user.id, file, rawText: cvTextFallback, analysis, isFallback: true });
        return res.status(200).json({
          status: 'success',
          data: { analysis, fallback: true, message: 'AI service is temporarily unavailable. Showing basic CV insights.' },
        });
      }

      return next(new AppError(message, status));
    }

    // Network errors
    if (!error.response) {
      if (
        error.code === 'ECONNREFUSED' ||
        error.code === 'ECONNABORTED' ||
        error.message?.includes('timeout')
      ) {
        let cvTextFallback = '';
        try { cvTextFallback = await extractTextFromUploadedFile(file); } catch (e) {}
        const analysis = buildBasicAnalysis(cvTextFallback, jobRequirementsArray);
        await cvService.saveAnalysisResult({ userId: req.user.id, file, rawText: cvTextFallback, analysis, isFallback: true });
        return res.status(200).json({
          status: 'success',
          data: { analysis, fallback: true, message: 'AI service is temporarily unavailable. Showing basic CV insights.' },
        });
      }

      const aiServiceUrl = process.env.AI_SERVICE_URL || 'http://localhost:8000';
      let cvTextFallback = '';
      try { cvTextFallback = await extractTextFromUploadedFile(file); } catch (e) {}
      const analysis = buildBasicAnalysis(cvTextFallback, jobRequirementsArray);
      await cvService.saveAnalysisResult({ userId: req.user.id, file, rawText: cvTextFallback, analysis, isFallback: true });
      return res.status(200).json({
        status: 'success',
        data: {
          analysis,
          fallback: true,
          message: `AI service is unavailable. Please check if the service is running at ${aiServiceUrl}.`,
        },
      });
    }

    const unexpectedError = new AppError(
      error.message || 'Failed to analyze CV file. Please try again.',
      error.status || 500
    );
    unexpectedError.isOperational = true;
    next(unexpectedError);
  }
};

// ─── revampCV ───────────────────────────────────────────────────────────────

exports.revampCV = async (req, res, next) => {
  try {
    const { cvData } = req.body || {};

    if (!cvData || typeof cvData !== 'object') {
      return res.status(400).json({ status: 'error', message: 'cvData is required' });
    }

    const queuedResult = await runAiTask(
      'cv:revamp',
      { cvData },
      async ({ cvData: taskCvData }) => {
        const response = await callWithRateLimitRetry(() =>
          aiServiceClient.post('/cv/revamp', { cvData: taskCvData })
        );
        return response.data;
      },
      { timeout: 60000, includeJobId: true }
    );

    const revamp = queuedResult.result || queuedResult;
    const meta = queuedResult.result
      ? { jobId: queuedResult.jobId, queued: queuedResult.queued }
      : undefined;

    return res.status(200).json({
      status: 'success',
      data: { revamp, ...(meta ? { meta } : {}) },
    });
  } catch (error) {
    console.error('[CV Controller] Error revamping CV:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      code: error.code,
    });

    const errorMessage = error.message || '';

    if (error.isRateLimit || errorMessage.toLowerCase().includes('rate limit')) {
      const retryAfter = error.retryAfter || 60;
      return res.status(429).json({
        status: 'error',
        message: `AI service is rate limited. Please try again in ${retryAfter} seconds.`,
        retryAfter,
      });
    }

    if (error.response?.status === 400) {
      return next(new BadRequestError(error.response?.data?.detail || 'Invalid CV data for revamp'));
    }

    if (
      error.response?.status === 401 ||
      error.response?.status === 503 ||
      error.code === 'ECONNABORTED' ||
      error.code === 'ECONNREFUSED' ||
      error.code === 'ENOTFOUND' ||
      error.code === 'ETIMEDOUT' ||
      !error.response
    ) {
      return next(new ServiceUnavailableError('AI service is temporarily unavailable. Please try again later.'));
    }

    return next(error);
  }
};

// ────────────────────────────────────────────────────────────────────────────────
// Stored CV profile (read/delete)
// ────────────────────────────────────────────────────────────────────────────────

const toBool = (value, defaultValue = false) => {
  if (value === undefined || value === null) return defaultValue;
  const normalized = String(value).trim().toLowerCase();
  if (['1', 'true', 'yes', 'y', 'on'].includes(normalized)) return true;
  if (['0', 'false', 'no', 'n', 'off'].includes(normalized)) return false;
  return defaultValue;
};

exports.getCvProfile = async (req, res, next) => {
  try {
    const includeRawTextRequested =
      req.query?.includeRawText === '1' ||
      req.query?.includeRawText === 'true';

    // Default: never return rawText to the browser. It can contain PII.
    // Allow opt-in only when explicitly enabled.
    const allowRawTextExport = toBool(process.env.CV_ALLOW_RAW_TEXT_EXPORT, false);

    const profile = await cvService.getCvProfile(req.user.id);
    if (!profile) {
      return res.status(200).json({ status: 'success', data: { profile: null } });
    }

    const safeProfile = { ...profile };
    if (!(includeRawTextRequested && allowRawTextExport)) {
      delete safeProfile.rawText;
    }

    return res.status(200).json({
      status: 'success',
      data: { profile: safeProfile },
    });
  } catch (error) {
    return next(error);
  }
};

exports.deleteCvProfile = async (req, res, next) => {
  try {
    await cvService.deleteCvProfile(req.user.id);
    return res.status(200).json({ status: 'success', message: 'CV profile deleted' });
  } catch (error) {
    return next(error);
  }
};
