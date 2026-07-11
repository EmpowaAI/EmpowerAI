const aiServiceClient = require('../../intergration/ai/ai.ServiceClient');
const interviewRepository = require('./interview.Repository');
const logger = require('../../utils/logger');
const { runAiTask } = require('../../intergration/queues/aiQueue');

function normalizeFeedback(feedbackData) {
  if (!feedbackData || typeof feedbackData !== 'object') {
    return null;
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
    feedback: feedbackData.feedback || '',
    strengths,
    improvements,
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

function toSessionResponse(row) {
  return {
    sessionId: row.id,
    type: row.type,
    difficulty: row.difficulty,
    company: row.company,
    questions: row.questions,
    answers: row.answers || [],
    status: row.status,
    startedAt: row.started_at,
    completedAt: row.completed_at || null,
  };
}

exports.startInterview = async (req, res, next) => {
  try {
    const { type, difficulty, company, cvData, jobDescription } = req.body;

    if (!type) {
      return res.status(400).json({
        status: 'error',
        message: 'Interview type is required'
      });
    }

    let aiSession;
    let meta = null;

    try {
      const queuedResult = await runAiTask(
        'interview:start',
        {
          type,
          difficulty: difficulty || 'medium',
          company: company || null,
          cvData: cvData || null,
          jobDescription: jobDescription || null,
        },
        async (taskPayload) => {
          // aiServiceClient's interceptor already unwraps the HTTP body.
          // 60s covers a cold AI-service start (~30-60s on Render free tier)
          // plus the 30s Azure completion.
          return aiServiceClient.post('/interview/start', taskPayload, { timeout: 60000 });
        },
        { timeout: 60000, includeJobId: true }
      );
      aiSession = (queuedResult && queuedResult.result) ? queuedResult.result : (queuedResult || null);
      meta = (queuedResult && queuedResult.jobId) ? { jobId: queuedResult.jobId, queued: !!queuedResult.queued } : null;
    } catch (aiError) {
      logger.error('Interview start: AI service failed', {
        correlationId: req.correlationId,
        error: aiError.message,
      });
      return res.status(503).json({
        status: 'error',
        message: 'The interview coach is temporarily unavailable. Please try again in a minute.',
      });
    }

    if (!aiSession || !Array.isArray(aiSession.questions) || aiSession.questions.length === 0) {
      logger.error('Interview start: AI returned no questions', { correlationId: req.correlationId });
      return res.status(502).json({
        status: 'error',
        message: 'The interview coach returned an invalid session. Please try again.',
      });
    }

    // Clamp difficulty to the DB CHECK set — the AI-echoed value is not
    // covered by the request validator and a stray value (e.g.
    // 'intermediate') would violate the interview_sessions constraint.
    const ALLOWED_DIFFICULTY = ['easy', 'medium', 'hard'];
    const candidateDifficulty = aiSession.difficulty || difficulty || 'medium';
    const safeDifficulty = ALLOWED_DIFFICULTY.includes(candidateDifficulty)
      ? candidateDifficulty
      : 'medium';

    // Persist so the session survives restarts and can be resumed
    const row = await interviewRepository.create({
      userId: req.user.id,
      type,
      difficulty: safeDifficulty,
      company: company || null,
      questions: aiSession.questions,
      cvData: cvData || null,
    });

    const sessionData = toSessionResponse(row);

    res.status(200).json({
      status: 'success',
      ...sessionData,
      data: {
        session: sessionData
      },
      meta
    });
  } catch (error) {
    logger.error('Error starting interview', {
      correlationId: req.correlationId,
      error: error.message,
    });
    next(error);
  }
};

exports.submitAnswer = async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    const { questionId, response, cvData } = req.body;

    if (!questionId || !response) {
      return res.status(400).json({
        status: 'error',
        message: 'Question ID and response are required'
      });
    }

    const session = await interviewRepository.findById(sessionId, req.user.id);
    if (!session) {
      return res.status(404).json({
        status: 'error',
        message: 'Interview session not found. It may have expired — please start a new interview.',
      });
    }

    const question = (session.questions || []).find((q) => q.id === questionId);
    if (!question) {
      return res.status(400).json({
        status: 'error',
        message: 'Question not found in this interview session.',
      });
    }

    // Prior answers give the AI conversational context
    const history = (session.answers || []).map((a) => ({
      question: a.question,
      response: a.response,
    }));

    let feedbackData;
    let meta = null;

    try {
      const queuedResult = await runAiTask(
        'interview:answer',
        {
          question: question.text,
          response,
          cvData: cvData || session.cv_data || null,
          history,
        },
        async (taskPayload) => {
          // aiServiceClient's interceptor already unwraps the HTTP body
          return aiServiceClient.post('/interview/answer', taskPayload, { timeout: 60000 });
        },
        { timeout: 60000, includeJobId: true }
      );
      feedbackData = (queuedResult && queuedResult.result) ? queuedResult.result : (queuedResult || null);
      meta = (queuedResult && queuedResult.jobId) ? { jobId: queuedResult.jobId, queued: !!queuedResult.queued } : null;
    } catch (aiError) {
      logger.error('Interview answer: AI service failed', {
        correlationId: req.correlationId,
        sessionId,
        error: aiError.message,
      });
      return res.status(503).json({
        status: 'error',
        message: 'The interview coach could not evaluate your answer right now. Your answer was not lost — please resubmit in a minute.',
      });
    }

    const rawScore = feedbackData?.score;
    feedbackData = normalizeFeedback(feedbackData);
    if (!feedbackData) {
      return res.status(502).json({
        status: 'error',
        message: 'The interview coach returned invalid feedback. Please resubmit your answer.',
      });
    }

    logger.info('Interview feedback normalized', {
      correlationId: req.correlationId,
      sessionId,
      questionId,
      rawScore,
      normalizedScore: feedbackData.score
    });

    await interviewRepository.appendAnswer(sessionId, req.user.id, {
      questionId,
      question: question.text,
      response,
      ...feedbackData,
      answeredAt: new Date().toISOString(),
    });

    res.status(200).json({
      status: 'success',
      data: {
        feedback: feedbackData,
        ...(meta ? { meta } : {})
      }
    });
  } catch (error) {
    logger.error('Error submitting answer', {
      correlationId: req.correlationId,
      error: error.message,
    });
    next(error);
  }
};

exports.getSession = async (req, res, next) => {
  try {
    const { sessionId } = req.params;

    const session = await interviewRepository.findById(sessionId, req.user.id);
    if (!session) {
      return res.status(404).json({
        status: 'error',
        message: 'Interview session not found.',
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        session: toSessionResponse(session)
      }
    });
  } catch (error) {
    logger.error('Error getting session', {
      correlationId: req.correlationId,
      error: error.message,
    });
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
