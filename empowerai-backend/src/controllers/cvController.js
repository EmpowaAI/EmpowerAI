const aiServiceClient = require('../services/aiServiceClient');
const { AppError, BadRequestError, ServiceUnavailableError } = require('../utils/errors');

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
    
    // Network errors, timeouts, etc.
    if (error.code === 'ECONNREFUSED' || error.code === 'ECONNABORTED' || !error.response) {
      const aiServiceUrl = process.env.AI_SERVICE_URL || 'http://localhost:8000';
      const errorMsg = error.code === 'ECONNREFUSED' 
        ? `Cannot connect to AI service at ${aiServiceUrl}. Please check if the service is running.`
        : error.code === 'ECONNABORTED'
        ? 'AI service request timed out. Please try again.'
        : 'AI service is unavailable. Please check if the service is running and the AI_SERVICE_URL environment variable is set correctly.';
      return next(new ServiceUnavailableError(errorMsg));
    }
    
    // Pass through other errors
    next(error);
  }
};

