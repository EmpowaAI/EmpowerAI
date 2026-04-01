const cvProfileRepository = require('../repositories/cvProfile.repository');
const aiServiceClient = require('./aiServiceClient');
const { runAiTask } = require('../queues/aiQueue');
const { extractSkillsEnhanced } = require('../utils/skillExtractors');
const { BadRequestError, ServiceUnavailableError, AppError } = require('../utils/errors');
const FormData = require('form-data');
const axios = require('axios');

const REQUEST_TIMEOUT = 30000;
const FILE_TIMEOUT = 60000;

// ─── HELPERS ──────────────────────────────────────────────

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const parseJobRequirements = (jobRequirements) => {
  if (!jobRequirements) return null;
  if (Array.isArray(jobRequirements)) return jobRequirements;
  if (typeof jobRequirements === 'string') {
    return jobRequirements.split(/[,\n]/).map((s) => s.trim()).filter(Boolean);
  }
  return null;
};

const buildBasicAnalysis = (cvText, jobRequirementsArray) => {
  const extractedSkills = extractSkillsEnhanced(cvText || '');
  const missingSkills = Array.isArray(jobRequirementsArray)
    ? jobRequirementsArray.filter(
        (req) => !extractedSkills.some((skill) => skill.toLowerCase().includes(req.toLowerCase()))
      )
    : [];

  const suggestions = [];
  if (extractedSkills.length === 0) {
    suggestions.push('Add more detail about your skills and tools to improve matching.');
  }
  if (missingSkills.length > 0) {
    suggestions.push(
      'Consider adding evidence for these requirements: ' + missingSkills.slice(0, 5).join(', ')
    );
  }
  suggestions.push('Include measurable outcomes (numbers, projects, and results) to strengthen your CV.');

  return { extractedSkills, missingSkills, suggestions, analysisSource: 'fallback' };
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

// ─── MAP AI RESPONSE → CVPROFILE FIELDS ───────────────────

const mapAnalysisToCvProfile = (analysis) => {
  const data = {};

  if (analysis.skills?.length) data.skills = analysis.skills;
  if (analysis.about) data.about = analysis.about;
  if (analysis.phone) data.phone = analysis.phone;
  if (analysis.address) data.address = analysis.address;

  if (analysis.education?.length) {
    data.education = analysis.education.map((e) => ({
      institution: e.institution || '',
      qualification: e.qualification || e.degree || '',
      fieldOfStudy: e.fieldOfStudy || e.field || '',
      startYear: e.startYear || null,
      endYear: e.endYear || null,
    }));
  }

  if (analysis.experience?.length) {
    data.experience = analysis.experience.map((e) => ({
      company: e.company || '',
      jobTitle: e.jobTitle || e.title || e.role || '',
      startYear: e.startYear || null,
      endYear: e.endYear || null,
      description: e.description || '',
    }));
  }

  if (analysis.achievements?.length) data.achievements = analysis.achievements;
  if (analysis.certifications?.length) data.certifications = analysis.certifications;

  if (analysis.socialLinks) {
    data.socialLinks = {
      linkedin: analysis.socialLinks.linkedin || '',
      github: analysis.socialLinks.github || '',
      portfolio: analysis.socialLinks.portfolio || '',
    };
  }

  return data;
};

// ─── SAVE ANALYSIS TO CVPROFILE ───────────────────────────

const persistAnalysis = async (userId, analysis) => {
  if (!userId || !analysis || analysis.analysisSource === 'fallback') return null;
  try {
    const profileData = mapAnalysisToCvProfile(analysis);
    if (!Object.keys(profileData).length) return null;
    return await cvProfileRepository.upsertByUserId(userId, profileData);
  } catch (err) {
    // Non-fatal — log and continue, don't fail the request over a save error
    console.error('[CV Service] Failed to persist analysis to CvProfile:', err.message);
    return null;
  }
};

// ─── ANALYZE CV (TEXT) ────────────────────────────────────

const analyzeCV = async (userId, cvText, jobRequirements) => {
  if (!cvText) throw new BadRequestError('CV text is required');

  const jobRequirementsArray = parseJobRequirements(jobRequirements);

  const queuedResult = await runAiTask(
    'cv:analyze',
    { cvText, jobRequirements: jobRequirementsArray },
    async ({ cvText: taskCvText, jobRequirements: taskRequirements }) => {
      const response = await callWithRateLimitRetry(() =>
        aiServiceClient.post('/cv/analyze', {
          cvText: taskCvText,
          jobRequirements: taskRequirements,
        })
      );
      return response.data;
    },
    { timeout: REQUEST_TIMEOUT, includeJobId: true }
  );

  const analysis = queuedResult.result || queuedResult;
  const meta = queuedResult.result
    ? { jobId: queuedResult.jobId, queued: queuedResult.queued }
    : undefined;

  await persistAnalysis(userId, analysis);

  return { analysis, meta };
};

// ─── ANALYZE CV (FILE) ────────────────────────────────────

const analyzeCVFile = async (userId, file, jobRequirements) => {
  if (!file) throw new BadRequestError('CV file is required');

  const jobRequirementsArray = parseJobRequirements(jobRequirements);
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
      if (payload.jobRequirements?.length) {
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
      ).then((res) => res.data);
    },
    { timeout: FILE_TIMEOUT, includeJobId: true }
  );

  const analysis = queuedResult.result || queuedResult;
  const meta = queuedResult.result
    ? { jobId: queuedResult.jobId, queued: queuedResult.queued }
    : undefined;

  await persistAnalysis(userId, analysis);

  return { analysis, meta };
};

// ─── REVAMP CV ────────────────────────────────────────────

const revampCV = async (cvData) => {
  if (!cvData || typeof cvData !== 'object') throw new BadRequestError('cvData is required');

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
};

module.exports = {
  analyzeCV,
  analyzeCVFile,
  revampCV,
  buildBasicAnalysis,
  parseJobRequirements,
};