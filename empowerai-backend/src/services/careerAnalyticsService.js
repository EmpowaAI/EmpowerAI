const CareerAnalytics = require('../models/CareerAnalytics');
const logger = require('../utils/logger');

async function recordCareerSelections(careers) {
  if (!Array.isArray(careers) || careers.length === 0) return;

  const unique = Array.from(new Set(careers.filter(Boolean)));
  const ops = unique.map(career => ({
    updateOne: {
      filter: { career },
      update: { $inc: { count: 1 }, $set: { lastSelectedAt: new Date() } },
      upsert: true
    }
  }));

  try {
    await CareerAnalytics.bulkWrite(ops);
  } catch (error) {
    logger.warn('Career analytics update failed', error.message);
  }
}

module.exports = {
  recordCareerSelections
};
