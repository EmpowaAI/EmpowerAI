const logger = require('../utils/logger');

const initSchedulers = () => {
  try {
    const { startRssScheduler } = require('./rssScheduler');
    const { startJobAPIScheduler } = require('./jobAPIScheduler');

    startRssScheduler();
    startJobAPIScheduler();

    logger.info('Schedulers started');
  } catch (err) {
    logger.error('Scheduler init failed', err);
  }
};

module.exports = { initSchedulers };