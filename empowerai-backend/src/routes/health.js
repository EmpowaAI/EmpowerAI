const express = require('express');
const mongoose = require('mongoose');
const { checkAiHealth } = require('../intergration/ai/ai.Health');
const { getAiQueueHealth, getAiJobStatus } = require('../intergration/queues/aiQueue');

const router = express.Router();

// Full health check — DB + AI service + memory + uptime
router.get('/', async (req, res) => {
  const aiServiceUrl = process.env.AI_SERVICE_URL;

  if (!aiServiceUrl && process.env.NODE_ENV === 'production') {
    const logger = require('../utils/logger');
    logger.error('CRITICAL: AI_SERVICE_URL environment variable is missing in production!');
  }

  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  const memoryUsage = process.memoryUsage();
  const { aiServiceStatus, aiServiceError } = await checkAiHealth();

  res.status(200).json({
    status: 'OK',
    message: 'EmpowerAI Backend is running',
    database: dbStatus,
    aiService: {
      status: aiServiceStatus,
      url: aiServiceUrl,
      error: aiServiceError,
    },
    uptime: Math.floor(process.uptime()),
    memory: {
      used: Math.round(memoryUsage.heapUsed / 1024 / 1024) + 'MB',
      total: Math.round(memoryUsage.heapTotal / 1024 / 1024) + 'MB',
    },
    timestamp: new Date().toISOString(),
    version: process.env.APP_VERSION || '1.0.0',
  });
});

// Liveness probe — is the process alive?
router.get('/live', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Alive',
    timestamp: new Date().toISOString(),
  });
});

// Readiness probe — is the server ready to serve traffic?
router.get('/ready', async (req, res) => {
  const dbReady = mongoose.connection.readyState === 1;

  let schedulers = null;
  try {
    const { getSchedulerStatus: getRssStatus } = require('../services/rssScheduler');
    const { getSchedulerStatus: getJobStatus } = require('../services/jobAPIScheduler');
    schedulers = {
      rss: getRssStatus(),
      jobApi: getJobStatus(),
    };
  } catch (e) {
    schedulers = { error: e.message };
  }

  if (!dbReady) {
    return res.status(503).json({
      status: 'NOT_READY',
      database: 'disconnected',
      schedulers,
      timestamp: new Date().toISOString(),
    });
  }

  res.status(200).json({
    status: 'READY',
    database: 'connected',
    schedulers,
    timestamp: new Date().toISOString(),
  });
});

// Queue health
router.get('/queue', async (req, res) => {
  const queueHealth = await getAiQueueHealth();
  res.status(200).json({
    status: 'OK',
    queue: queueHealth,
    timestamp: new Date().toISOString(),
  });
});

// Queue job status
router.get('/queue/jobs/:jobId', async (req, res) => {
  const { jobId } = req.params;
  const status = await getAiJobStatus(jobId);
  res.status(200).json({
    status: 'OK',
    ...status,
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
