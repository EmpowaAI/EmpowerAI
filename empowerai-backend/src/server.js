require('dotenv').config();

const app = require('./app');
const logger = require('./utils/logger');
const { connectDatabase } = require('./config/database');
const { pingAiServiceOnStartup } = require('./config/aiHealth');
const { runStartupTasks } = require('./config/seed');
const { registerProcessHandlers } = require('./utils/shutdown');
const { initAiQueue } = require('./queues/aiQueue');

const PORT = process.env.PORT || 5000;

async function boot() {
  // Initialize background queue (no-op unless enabled via env)
  initAiQueue();

  // Log AI service config so it's visible on every cold start
  const aiServiceUrl =
    process.env.AI_SERVICE_URL ||
    (process.env.NODE_ENV === 'production' ? 'MISSING_URL' : 'http://localhost:8000');

  logger.info('AI Service Configuration', {
    aiServiceUrl,
    baseURL: `${aiServiceUrl}/api`,
    cvAnalyzeEndpoint: `${aiServiceUrl}/api/cv/analyze`,
    healthCheckEndpoint: `${aiServiceUrl}/health`,
  });

  // Connect to MongoDB
  const dbConnected = await connectDatabase();

  // Run startup tasks (seed, schedulers) — skipped if DB is down
  await runStartupTasks(dbConnected);

  // Start HTTP server
  const serverInstance = app.listen(PORT, () => {
    logger.info('Server started successfully', {
      port: PORT,
      environment: process.env.NODE_ENV || 'development',
      healthCheck: `http://localhost:${PORT}/api/health`,
      aiServiceUrl,
      databaseStatus: dbConnected ? 'connected' : 'disconnected',
    });
  });

  // Register shutdown + uncaught error handlers
  registerProcessHandlers(serverInstance);

  // Non-blocking AI service ping (production only)
  pingAiServiceOnStartup();
}

boot();
