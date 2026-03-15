const aiServiceClient = require('../services/aiServiceClient');
const { AppError, BadRequestError, ServiceUnavailableError, RateLimitError } = require('../utils/errors');
const FormData = require('form-data');
const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');
const { runAiTask } = require('../queues/aiQueue');
const { extractSkillsEnhanced } = require('../utils/skillExtractors');

// Request timeout constant (matches aiServiceClient timeout)
const REQUEST_TIMEOUT = 30000; // 30 seconds

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const buildBasicAnalysis = (cvText, jobRequirementsArray) => {
  const extractedSkills = extractSkillsEnhanced(cvText || '');
  const missingSkills = Array.isArray(jobRequirementsArray)
    ? jobRequirementsArray.filter(req =>
        !extractedSkills.some(skill => skill.toLowerCase().includes(req.toLowerCase()))
      )
    : [];
  const suggestions = [];

  if (extractedSkills.length === 0) {
    suggestions.push('Add more detail about your skills and tools to improve matching.');
  }
  if (missingSkills.length > 0) {
    suggestions.push('Consider adding evidence for these requirements: ' + missingSkills.slice(0, 5).join(', '));
  }
  suggestions.push('Include measurable outcomes (numbers, projects, and results) to strengthen your CV.');

  return {
    extractedSkills,
    missingSkills,
    suggestions,
    analysisSource: 'fallback'
  };
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

exports.analyzeCV = async (req, res, next) => {
  let cvText = null;
  let jobRequirementsArray = null;
  try {
    const { cvText: cvTextInput, jobRequirements } = req.body;
    cvText = cvTextInput;

    if (!cvText) {
      return res.status(400).json({
        status: 'error',
        message: 'CV text is required'
      });
    }

    // Convert jobRequirements to array if it's a string
    jobRequirementsArray = null;
    if (jobRequirements) {
      if (typeof jobRequirements === 'string') {
        // Split by comma or newline to create array
        jobRequirementsArray = jobRequirements.split(/[,\n]/).map(s => s.trim()).filter(s => s);
      } else if (Array.isArray(jobRequirements)) {
        jobRequirementsArray = jobRequirements;
      }
    }
    
    const aiServiceUrl = process.env.AI_SERVICE_URL || 'http://localhost:8000';
    console.log('[CV Controller] Calling AI service for CV analysis...', {
      aiServiceUrl,
      endpoint: '/cv/analyze',
      fullUrl: `${aiServiceUrl}/api/cv/analyze`
    });
    const queuedResult = await runAiTask(
      'cv:analyze',
      {
        cvText,
        jobRequirements: jobRequirementsArray
      },
      async ({ cvText: taskCvText, jobRequirements: taskRequirements }) => {
        const response = await callWithRateLimitRetry(() =>
          aiServiceClient.post('/cv/analyze', {
            cvText: taskCvText,
            jobRequirements: taskRequirements
          })
        )
        return response.data
      },
      { timeout: REQUEST_TIMEOUT, includeJobId: true }
    );

    const analysis = queuedResult.result || queuedResult
    const meta = queuedResult.result ? { jobId: queuedResult.jobId, queued: queuedResult.queued } : undefined

    console.log('[CV Controller] AI service response received successfully');
    res.status(200).json({
      status: 'success',
      data: {
        analysis,
        ...(meta ? { meta } : {})
      }
    });
  } catch (error) {
    console.error('[CV Controller] Error analyzing CV:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      code: error.code
    });
    
    // Check for rate limit errors in the error message (from aiServiceClient)
    const errorMessage = error.message || '';
    if (error.isRateLimit || errorMessage.toLowerCase().includes('rate limit')) {
      const retryAfter = error.retryAfter || 60;
      const analysis = buildBasicAnalysis(cvText, jobRequirementsArray);
      return res.status(200).json({
        status: 'success',
        data: {
          analysis,
          fallback: true,
          message: `AI service is rate limited. Showing basic CV insights while you wait ${retryAfter} seconds.`
        }
      });
    }
    
    // Wrap AI service errors as operational errors so they show proper messages
    if (error.response) {
      const status = error.response.status;
      const data = error.response.data;
      const message = data?.message || data?.detail || error.message || 'Failed to analyze CV';
      
      if (status === 400) {
        return next(new BadRequestError(message));
      } else if (status === 429 || status === 503) {
        const analysis = buildBasicAnalysis(cvText, jobRequirementsArray);
        return res.status(200).json({
          status: 'success',
          data: {
            analysis,
            fallback: true,
            message: 'AI service is temporarily unavailable. Showing basic CV insights.'
          }
        });
      } else if (status >= 500) {
        return next(new ServiceUnavailableError('AI service is temporarily unavailable. Please try again later.'));
      } else {
        return next(new AppError(message, status));
      }
    }
    
    // Network errors, timeouts, DNS errors, etc.
    if (!error.response) {
      const aiServiceUrl = process.env.AI_SERVICE_URL || 'http://localhost:8000';
      const errorCode = error.code || error.errno || 'UNKNOWN';
      const errorMessage = error.message || 'Unknown error';
      
      console.error('[CV Controller] Network error details:', {
        code: errorCode,
        message: errorMessage,
        stack: error.stack,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          baseURL: error.config?.baseURL,
          timeout: error.config?.timeout
        }
      });
      
      let errorMsg;
      switch (errorCode) {
        case 'ECONNREFUSED':
          errorMsg = `Cannot connect to AI service at ${aiServiceUrl}. The service may be down or not accepting connections.`;
          break;
        case 'ECONNABORTED':
          // Check if this is a Render cold start
          const isRender = (process.env.AI_SERVICE_URL || '').includes('render.com') || (process.env.AI_SERVICE_URL || '').includes('onrender.com');
          if (isRender || error.isRenderColdStart) {
            errorMsg = `AI service is waking up (Render free tier cold start). Please wait 30-60 seconds and try again.`;
          } else {
            errorMsg = `AI service request timed out after ${REQUEST_TIMEOUT}ms. The service may be slow or unresponsive.`;
          }
          break;
        case 'ENOTFOUND':
          errorMsg = `Cannot resolve AI service hostname. Please check that AI_SERVICE_URL (${aiServiceUrl}) is correct.`;
          break;
        case 'ETIMEDOUT':
          errorMsg = `AI service connection timed out. Please check if the service is running at ${aiServiceUrl}.`;
          break;
        default:
          errorMsg = `AI service is unavailable (${errorCode}: ${errorMessage}). Please check if the service is running at ${aiServiceUrl} and the AI_SERVICE_URL environment variable is set correctly.`;
      }
      
      const analysis = buildBasicAnalysis(cvText, jobRequirementsArray);
      return res.status(200).json({
        status: 'success',
        data: {
          analysis,
          fallback: true,
          message: errorMsg
        }
      });
    }
    
    // Pass through other errors
    next(error);
  }
};

/**
 * Analyze CV from uploaded file
 * @route POST /api/cv/analyze-file
 * @access Private
 */
exports.analyzeCVFile = async (req, res, next) => {
  let file = null;
  let jobRequirementsArray = null;
  try {
    if (!req.file) {
      return res.status(400).json({
        status: 'error',
        message: 'CV file is required'
      });
    }

    const { jobRequirements } = req.body;
    file = req.file;

    // Convert jobRequirements to array if it's a string
    jobRequirementsArray = null;
    if (jobRequirements) {
      if (typeof jobRequirements === 'string') {
        jobRequirementsArray = jobRequirements.split(/[,\n]/).map(s => s.trim()).filter(s => s);
      } else if (Array.isArray(jobRequirements)) {
        jobRequirementsArray = jobRequirements;
      }
    }

    console.log('[CV Controller] Calling AI service for CV file analysis...', {
      filename: file.originalname,
      mimetype: file.mimetype,
      size: file.size
    });

    // Send file to AI service for parsing and analysis
    // The AI service has PyPDF2 and python-docx for parsing
    const formData = new FormData();
    formData.append('cvFile', file.buffer, {
      filename: file.originalname,
      contentType: file.mimetype
    });
    if (jobRequirementsArray && jobRequirementsArray.length > 0) {
      formData.append('jobRequirements', JSON.stringify(jobRequirementsArray));
    }

    const aiServiceUrl = process.env.AI_SERVICE_URL || 'http://localhost:8000';
    const aiServiceApiKey = process.env.AI_SERVICE_API_KEY;
    // Use axios directly for FormData (aiServiceClient doesn't handle FormData well)
    const queuedResult = await runAiTask(
      'cv:analyze-file',
      {
        fileBuffer: file.buffer.toString('base64'),
        filename: file.originalname,
        mimetype: file.mimetype,
        jobRequirements: jobRequirementsArray || []
      },
      async (payload) => {
        const payloadForm = new FormData();
        payloadForm.append('cvFile', Buffer.from(payload.fileBuffer, 'base64'), {
          filename: payload.filename,
          contentType: payload.mimetype
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
            maxBodyLength: 10 * 1024 * 1024
          })
        ).then((response) => response.data);
      },
      { timeout: 60000, includeJobId: true }
    );

    const analysis = queuedResult.result || queuedResult
    const meta = queuedResult.result ? { jobId: queuedResult.jobId, queued: queuedResult.queued } : undefined

    console.log('[CV Controller] AI service response received successfully');
    res.status(200).json({
      status: 'success',
      data: {
        analysis,
        ...(meta ? { meta } : {})
      }
    });
  } catch (error) {
    console.error('[CV Controller] Error analyzing CV file:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      code: error.code
    });
    
    // Check for rate limit errors (from OpenAI API via AI service)
    const errorMessage = error.message || '';
    const isOpenAIRateLimit = error.response?.status === 429 && 
                              (errorMessage.toLowerCase().includes('openai') || 
                               errorMessage.toLowerCase().includes('rate limit'));
    
    if (error.isRateLimit || isOpenAIRateLimit || errorMessage.toLowerCase().includes('rate limit')) {
      const retryAfter = error.retryAfter || error.response?.data?.retryAfter || 60;
      let cvTextFallback = '';
      if (file.mimetype === 'text/plain' || file.originalname?.toLowerCase().endsWith('.txt')) {
        cvTextFallback = file.buffer.toString('utf8');
      }
      const analysis = buildBasicAnalysis(cvTextFallback, jobRequirementsArray);
      return res.status(200).json({
        status: 'success',
        data: {
          analysis,
          fallback: true,
          message: `AI service is rate limited. Showing basic CV insights while you wait ${retryAfter} seconds.`,
          source: isOpenAIRateLimit ? 'openai' : 'backend'
        }
      });
    }
    
    // Handle file-specific errors
    if (error.message && error.message.includes('Invalid file type')) {
      return next(new BadRequestError(error.message));
    }
    
    // Wrap AI service errors
    if (error.response) {
      const status = error.response.status;
      const data = error.response.data;
      const message = data?.message || data?.detail || error.message || 'Failed to analyze CV file';
      
      if (status === 400) {
        return next(new BadRequestError(message));
      } else if (status === 429 || status === 503) {
        let cvTextFallback = '';
        if (file.mimetype === 'text/plain' || file.originalname?.toLowerCase().endsWith('.txt')) {
          cvTextFallback = file.buffer.toString('utf8');
        }
        const analysis = buildBasicAnalysis(cvTextFallback, jobRequirementsArray);
        return res.status(200).json({
          status: 'success',
          data: {
            analysis,
            fallback: true,
            message: 'AI service is temporarily unavailable. Showing basic CV insights.'
          }
        });
      } else if (status >= 500) {
        return next(new ServiceUnavailableError('AI service is temporarily unavailable. Please try again later.'));
      } else {
        return next(new AppError(message, status));
      }
    }
    
    // Network errors or errors without response
    if (!error.response) {
      if (error.code === 'ECONNREFUSED' || error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        const analysis = buildBasicAnalysis('', jobRequirementsArray);
        return res.status(200).json({
          status: 'success',
          data: {
            analysis,
            fallback: true,
            message: 'AI service is temporarily unavailable. Showing basic CV insights.'
          }
        });
      }
      const aiServiceUrl = process.env.AI_SERVICE_URL || 'http://localhost:8000';
      const analysis = buildBasicAnalysis('', jobRequirementsArray);
      return res.status(200).json({
        status: 'success',
        data: {
          analysis,
          fallback: true,
          message: `AI service is unavailable. Please check if the service is running at ${aiServiceUrl}.`
        }
      });
    }
    
    // If we get here, it's an unexpected error - make it operational so it shows a proper message
    const unexpectedError = new AppError(error.message || 'Failed to analyze CV file. Please try again.', error.status || 500);
    unexpectedError.isOperational = true;
    next(unexpectedError);
  }
};
