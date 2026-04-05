const mongoose = require('mongoose');
const logger = require('./logger');

function createShutdownHandler(serverInstance) {
  return async function shutdown(signal) {
    try {
      logger.info('Shutdown signal received', { signal });

      const { stopRssScheduler } = require('../services/rssScheduler');
      const { stopJobAPIScheduler } = require('../services/jobAPIScheduler');
      stopRssScheduler();
      stopJobAPIScheduler();

      if (serverInstance) {
        await new Promise((resolve) => serverInstance.close(resolve));
        logger.info('HTTP server closed');
      }

      await mongoose.connection.close(false);
      logger.info('MongoDB connection closed');

      logger.info('Shutdown complete');
      process.exit(0);
    } catch (error) {
      logger.error('Shutdown error', { error: error.message });
      process.exit(1);
    }
  };
}

function registerProcessHandlers(serverInstance) {
  const shutdown = createShutdownHandler(serverInstance);

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  process.on('unhandledRejection', (reason) => {
    logger.error('Unhandled Promise Rejection', { reason });
  });

  process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception', {
      error: error.message,
      stack: error.stack,
    });
  });
}

module.exports = { registerProcessHandlers };
