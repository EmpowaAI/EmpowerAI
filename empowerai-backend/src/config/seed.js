const logger = require('../utils/logger');

async function seedOpportunitiesIfEmpty() {
  try {
    const Opportunity = require('../models/Opportunity');
    const opportunityCount = await Opportunity.countDocuments({ isActive: true });

    if (opportunityCount === 0) {
      logger.info('No opportunities found in database, auto-seeding...');
      const { seedOpportunities } = require('../../scripts/seedOpportunities');
      const result = await seedOpportunities();
      logger.info(`Auto-seeded ${result?.new || 0} opportunities`);
    } else {
      logger.info(`Database already has ${opportunityCount} opportunities`);
    }
  } catch (error) {
    logger.warn('Failed to auto-seed opportunities:', error.message);
    // Non-fatal — don't block server startup
  }
}

async function startSchedulers() {
  if (process.env.ENABLE_RSS_SCHEDULER !== 'false') {
    try {
      const { startRssScheduler } = require('../services/rssScheduler');
      startRssScheduler();
      logger.info('RSS feed scheduler initialized');
    } catch (error) {
      logger.warn('Failed to start RSS feed scheduler:', error.message);
    }
  }

  if (process.env.ENABLE_JOB_API_SCHEDULER !== 'false') {
    try {
      const { startJobAPIScheduler } = require('../services/jobAPIScheduler');
      startJobAPIScheduler();
      logger.info('Job API scheduler initialized');
    } catch (error) {
      logger.warn('Failed to start Job API scheduler:', error.message);
    }
  }
}

async function runStartupTasks(dbConnected) {
  if (!dbConnected) {
    logger.warn('Database not connected — skipping startup tasks');
    return;
  }

  logger.info('Database ready, running startup tasks');
  await seedOpportunitiesIfEmpty();
  await startSchedulers();
}

module.exports = { runStartupTasks };
