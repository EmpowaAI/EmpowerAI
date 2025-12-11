const aiServiceClient = require('../services/aiServiceClient');

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
    
    const response = await aiServiceClient.post('/cv/analyze', {
      cvText,
      jobRequirements: jobRequirementsArray
    });

    res.status(200).json({
      status: 'success',
      data: {
        analysis: response.data
      }
    });
  } catch (error) {
    console.error('Error analyzing CV:', error.response?.data || error.message);
    next(error);
  }
};

