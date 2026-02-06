const aiServiceClient = require('../services/aiServiceClient');
const { v4: uuidv4 } = require('uuid');
const logger = require('../utils/logger');

// Fallback interview questions when AI service is unavailable
function generateFallbackQuestions(type, difficulty) {
  const questionSets = {
    tech: [
      { id: uuidv4(), text: 'Can you describe your experience with web development? What technologies have you worked with?' },
      { id: uuidv4(), text: 'How do you approach debugging a complex technical issue?' },
      { id: uuidv4(), text: 'Tell me about a challenging technical project you completed. What was your role and what was the outcome?' },
      { id: uuidv4(), text: 'How do you stay updated with new technologies and best practices in your field?' },
      { id: uuidv4(), text: 'Describe a situation where you had to learn a new technology quickly. How did you approach it?' }
    ],
    behavioral: [
      { id: uuidv4(), text: 'Tell me about a time when you had to work with a difficult team member. How did you handle it?' },
      { id: uuidv4(), text: 'Describe a situation where you had to meet a tight deadline. How did you manage your time?' },
      { id: uuidv4(), text: 'Can you give an example of when you showed leadership, even if you weren\'t in a leadership position?' },
      { id: uuidv4(), text: 'Tell me about a time you failed at something. What did you learn from it?' },
      { id: uuidv4(), text: 'Describe a situation where you had to adapt to significant changes at work.' }
    ],
    'non-tech': [
      { id: uuidv4(), text: 'Why are you interested in this position and our company?' },
      { id: uuidv4(), text: 'What are your greatest strengths and how would they benefit our team?' },
      { id: uuidv4(), text: 'Where do you see yourself in 3-5 years?' },
      { id: uuidv4(), text: 'Can you describe your ideal work environment?' },
      { id: uuidv4(), text: 'Tell me about a time you went above and beyond in your role.' }
    ]
  };

  return questionSets[type] || questionSets['non-tech'];
}

// Generate fallback feedback for answer
function generateFallbackFeedback(response) {
  const wordCount = response.trim().split(/\s+/).length;
  let score = 0.7; // Base score
  let feedback = '';

  // Adjust score based on response length
  if (wordCount < 20) {
    score = 0.5;
    feedback = 'Your answer is quite brief. Try to provide more detail and specific examples using the STAR method (Situation, Task, Action, Result).';
  } else if (wordCount < 50) {
    score = 0.65;
    feedback = 'Good start! Consider adding more specific examples and details about the outcomes of your actions.';
  } else if (wordCount < 100) {
    score = 0.75;
    feedback = 'Well-structured response! You provided good detail. Consider quantifying your achievements where possible.';
  } else {
    score = 0.8;
    feedback = 'Excellent detailed response! You covered the topic well with specific examples.';
  }

  return {
    score,
    feedback,
    strengths: [
      'Clear communication',
      'Relevant experience shared'
    ],
    improvements: [
      'Add more specific metrics and outcomes',
      'Use the STAR method for better structure'
    ]
  };
}

function normalizeFeedback(feedbackData) {
  if (!feedbackData || typeof feedbackData !== 'object') {
    return {
      score: 0.6,
      feedback: 'Thanks for your response. Try to add more structure and specific examples.',
      strengths: ['Clear effort'],
      improvements: ['Add more detail']
    };
  }

  let score = typeof feedbackData.score === 'number' ? feedbackData.score : 0.6;
  // Normalize score to 0..1 scale
  if (score > 1 && score <= 10) score = score / 10;
  if (score > 10 && score <= 100) score = score / 100;
  if (score < 0) score = 0;
  if (score > 1) score = 1;

  const strengths = Array.isArray(feedbackData.strengths) ? feedbackData.strengths : [];
  const improvements = Array.isArray(feedbackData.improvements) ? feedbackData.improvements : [];

  return {
    score,
    feedback: feedbackData.feedback || 'Thanks for your response. Try to add more structure and specific examples.',
    strengths: strengths.length > 0 ? strengths : ['Clear effort'],
    improvements: improvements.length > 0 ? improvements : ['Add more detail']
  };
}

function normalizeScoreOnly(rawScore) {
  let score = typeof rawScore === 'number' ? rawScore : 0.6;
  if (score > 1 && score <= 10) score = score / 10;
  if (score > 10 && score <= 100) score = score / 100;
  if (score < 0) score = 0;
  if (score > 1) score = 1;
  return score;
}

exports.startInterview = async (req, res, next) => {
  try {
    const { type, difficulty, company } = req.body;

    if (!type) {
      return res.status(400).json({
        status: 'error',
        message: 'Interview type is required'
      });
    }

    let sessionData;

    try {
      // Try AI service first with shorter timeout
      const response = await aiServiceClient.post('/interview/start', {
        type: type,
        difficulty: difficulty || 'medium',
        company: company || null
      }, { timeout: 8000 }); // 8 second timeout

      sessionData = response.data;
      console.log('AI service interview start successful');
    } catch (aiError) {
      // AI service failed - use fallback questions
      console.log('AI service unavailable, using fallback interview questions:', aiError.message);
      
      const sessionId = uuidv4();
      const questions = generateFallbackQuestions(type, difficulty);
      
      sessionData = {
        sessionId,
        type,
        difficulty: difficulty || 'medium',
        questions,
        company: company || null,
        startedAt: new Date().toISOString()
      };
    }

    res.status(200).json({
      status: 'success',
      data: {
        session: sessionData
      }
    });
  } catch (error) {
    console.error('Error starting interview:', error.response?.data || error.message);
    
    // Return user-friendly error message
    const errorMessage = error.response?.data?.detail || 
                        error.response?.data?.message || 
                        error.message || 
                        'Failed to start interview. Please try again.';
    
    return res.status(error.response?.status || 500).json({
      status: 'error',
      message: errorMessage
    });
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

    let feedbackData;

    try {
      // Try AI service first with shorter timeout
      const apiResponse = await aiServiceClient.post('/interview/answer', {
        questionId,
        response
      }, { timeout: 8000 }); // 8 second timeout

      feedbackData = apiResponse.data;
      console.log('AI service feedback successful');
    } catch (aiError) {
      // AI service failed - use fallback feedback
      console.log('AI service unavailable, using fallback feedback:', aiError.message);
      feedbackData = generateFallbackFeedback(response);
    }

    const rawScore = feedbackData?.score;
    feedbackData = normalizeFeedback(feedbackData);
    logger.info('Interview feedback normalized', {
      correlationId: req.correlationId,
      sessionId,
      questionId,
      rawScore,
      normalizedScore: feedbackData.score
    });

    res.status(200).json({
      status: 'success',
      data: {
        feedback: feedbackData
      }
    });
  } catch (error) {
    console.error('Error submitting answer:', error.response?.data || error.message);
    
    const errorMessage = error.response?.data?.detail || 
                      error.response?.data?.message || 
                      error.message || 
                      'Failed to submit answer. Please try again.';
    
    return res.status(error.response?.status || 500).json({
      status: 'error',
      message: errorMessage
    });
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
exports.debugNormalizeScore = async (req, res) => {
  const { score } = req.body || {};
  const normalized = normalizeScoreOnly(score);
  logger.info('Interview debug normalize', {
    correlationId: req.correlationId,
    rawScore: score,
    normalizedScore: normalized
  });
  res.status(200).json({
    status: 'success',
    data: {
      rawScore: score,
      normalizedScore: normalized
    }
  });
};


