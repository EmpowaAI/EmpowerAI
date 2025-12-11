const aiServiceClient = require('../services/aiServiceClient');

exports.startInterview = async (req, res, next) => {
  try {
    const { type, difficulty, company } = req.body;

    if (!type) {
      return res.status(400).json({
        status: 'error',
        message: 'Interview type is required'
      });
    }

    const response = await aiServiceClient.post('/interview/start', {
      type: type,
      difficulty: difficulty || 'medium',
      company: company || null
    });

    res.status(200).json({
      status: 'success',
      data: {
        session: response.data
      }
    });
  } catch (error) {
    console.error('Error starting interview:', error.response?.data || error.message);
    next(error);
  }
};

exports.submitAnswer = async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    const { questionId, response } = req.body;

    if (!questionId || !response) {
      return res.status(400).json({
        status: 'error',
        message: 'Question ID and response are required'
      });
    }

    const apiResponse = await aiServiceClient.post(`/interview/${sessionId}/answer`, {
      questionId,
      response
    });

    res.status(200).json({
      status: 'success',
      data: {
        feedback: apiResponse.data
      }
    });
  } catch (error) {
    console.error('Error submitting answer:', error.response?.data || error.message);
    next(error);
  }
};

exports.getSession = async (req, res, next) => {
  try {
    const { sessionId } = req.params;

    const response = await aiServiceClient.get(`/interview/${sessionId}`);

    res.status(200).json({
      status: 'success',
      data: {
        session: response.data
      }
    });
  } catch (error) {
    console.error('Error getting session:', error.response?.data || error.message);
    next(error);
  }
};

