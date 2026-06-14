require('dotenv').config();

const app = require('./app');
const logger = require('./utils/logger');
const { connectDatabase } = require('./infrastructures/database');
const { runStartupTasks } = require('./config/seed');
const { pingAiServiceOnStartup } = require('./intergration/ai/ai.Health');
const { registerProcessHandlers } = require('./utils/shutdown');
const { initAiQueue } = require('./intergration/queues/aiQueue');

const PORT = process.env.PORT || 5000;

async function boot() {
  initAiQueue();

  const aiServiceUrl =
    process.env.AI_SERVICE_URL ||
    (process.env.NODE_ENV === 'production' ? 'MISSING_URL' : 'http://localhost:8000');

  logger.info('AI Service Configuration', {
    aiServiceUrl,
    baseURL: `${aiServiceUrl}/api`,
    cvAnalyzeEndpoint: `${aiServiceUrl}/api/cv/analyze`,
    healthCheckEndpoint: `${aiServiceUrl}/health`,
  });

  const dbConnected = await connectDatabase();
  await runStartupTasks(dbConnected);

  const serverInstance = app.listen(PORT, () => {
    logger.info('Server started successfully', {
      port: PORT,
      environment: process.env.NODE_ENV || 'development',
      healthCheck: `http://localhost:${PORT}/api/health`,
      aiServiceUrl,
      databaseStatus: dbConnected ? 'connected' : 'disconnected',
    });
  });

  registerProcessHandlers(serverInstance);
  pingAiServiceOnStartup();
}

boot();
