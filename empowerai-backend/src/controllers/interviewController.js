const axios = require('axios');

exports.startInterview = async (req, res, next) => {
  try {
    const { type, difficulty, company } = req.body;

    if (!type) {
      return res.status(400).json({
        status: 'error',
        message: 'Interview type is required'
      });
    }

    // Call Python AI service to start interview
    const aiServiceUrl = process.env.AI_SERVICE_URL || 'http://localhost:8000';
    const aiResponse = await axios.post(`${aiServiceUrl}/api/interview/start`, {
      type: type, // 'tech', 'behavioral', or 'non-tech'
      difficulty: difficulty || 'medium', // 'easy', 'medium', or 'hard'
      company: company || null
    });

    res.status(200).json({
      status: 'success',
      data: {
        session: aiResponse.data
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

    // Call Python AI service to evaluate answer
    const aiServiceUrl = process.env.AI_SERVICE_URL || 'http://localhost:8000';
    const aiResponse = await axios.post(`${aiServiceUrl}/api/interview/${sessionId}/answer`, {
      questionId,
      response
    });

    res.status(200).json({
      status: 'success',
      data: {
        feedback: aiResponse.data
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

    // Call Python AI service to get session
    const aiServiceUrl = process.env.AI_SERVICE_URL || 'http://localhost:8000';
    const aiResponse = await axios.get(`${aiServiceUrl}/api/interview/${sessionId}`);

    res.status(200).json({
      status: 'success',
      data: {
        session: aiResponse.data
      }
    });
  } catch (error) {
    console.error('Error getting session:', error.response?.data || error.message);
    next(error);
  }
};

