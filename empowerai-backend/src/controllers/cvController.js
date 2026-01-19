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
    
    console.log('[CV Controller] Calling AI service for CV analysis...');
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
      return next(new ServiceUnavailableError('AI service is unavailable. Please try again later.'));
    }
    
    // Pass through other errors
    next(error);
  }
};

