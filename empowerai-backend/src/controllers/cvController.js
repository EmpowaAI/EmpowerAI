const aiServiceClient = require('../services/aiServiceClient');
const { AppError, BadRequestError, ServiceUnavailableError, RateLimitError } = require('../utils/errors');
const FormData = require('form-data');
const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');

// Request timeout constant (matches aiServiceClient timeout)
const REQUEST_TIMEOUT = 30000; // 30 seconds

exports.analyzeCV = async (req, res, next) => {
  try {
    const { cvText, jobRequirements } = req.body;

    if (!cvText) {
      return res.status(400).json({
        status: 'error',
        message: 'CV text is required'
      });
    }

    // Convert jobRequirements to array if it's a string
    let jobRequirementsArray = null;
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
    const response = await aiServiceClient.post('/cv/analyze', {
      cvText,
      jobRequirements: jobRequirementsArray
    });

    console.log('[CV Controller] AI service response received successfully');
    res.status(200).json({
      status: 'success',
      data: {
        analysis: response.data
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
      const message = errorMessage || `AI service is rate limited. Please try again in ${retryAfter} seconds.`;
      return res.status(429).json({
        status: 'error',
        message,
        retryAfter,
        code: 'RATE_LIMIT'
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
        return next(new ServiceUnavailableError(message));
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
      
      return next(new ServiceUnavailableError(errorMsg));
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
  try {
    if (!req.file) {
      return res.status(400).json({
        status: 'error',
        message: 'CV file is required'
      });
    }

    const { jobRequirements } = req.body;
    const file = req.file;

    // Convert jobRequirements to array if it's a string
    let jobRequirementsArray = null;
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
    // Use axios directly for FormData (aiServiceClient doesn't handle FormData well)
    const response = await axios.post(`${aiServiceUrl}/api/cv/analyze-file`, formData, {
      headers: {
        ...formData.getHeaders()
      },
      timeout: 60000, // 60 seconds for file processing
      maxContentLength: 10 * 1024 * 1024, // 10MB
      maxBodyLength: 10 * 1024 * 1024 // 10MB
    });

    console.log('[CV Controller] AI service response received successfully');
    res.status(200).json({
      status: 'success',
      data: {
        analysis: response.data
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
      // Provide clearer message if it's OpenAI rate limit
      const message = isOpenAIRateLimit 
        ? 'OpenAI API rate limit reached. Please wait a moment and try again.'
        : errorMessage || `AI service is rate limited. Please try again in ${retryAfter} seconds.`;
      return res.status(429).json({
        status: 'error',
        message,
        retryAfter,
        code: 'RATE_LIMIT',
        source: isOpenAIRateLimit ? 'openai' : 'backend'
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
      } else if (status === 429) {
        // Rate limit error - use RateLimitError class
        const retryAfter = data?.retryAfter || data?.retry_after || 60;
        const rateLimitMessage = `AI service is currently rate limited. Please wait ${retryAfter} seconds and try again.`;
        return next(new RateLimitError(rateLimitMessage, retryAfter));
      } else if (status === 503) {
        return next(new ServiceUnavailableError(message || 'AI service is temporarily unavailable. Please try again later.'));
      } else if (status >= 500) {
        return next(new ServiceUnavailableError('AI service is temporarily unavailable. Please try again later.'));
      } else {
        return next(new AppError(message, status));
      }
    }
    
    // Network errors or errors without response
    if (!error.response) {
      if (error.code === 'ECONNREFUSED' || error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        return next(new ServiceUnavailableError('AI service is temporarily unavailable. This might be due to the service waking up (Render free tier). Please wait a moment and try again.'));
      }
      const aiServiceUrl = process.env.AI_SERVICE_URL || 'http://localhost:8000';
      return next(new ServiceUnavailableError(`AI service is unavailable. Please check if the service is running at ${aiServiceUrl}.`));
    }
    
    // If we get here, it's an unexpected error - make it operational so it shows a proper message
    const unexpectedError = new AppError(error.message || 'Failed to analyze CV file. Please try again.', error.status || 500);
    unexpectedError.isOperational = true;
    next(unexpectedError);
  }
};
