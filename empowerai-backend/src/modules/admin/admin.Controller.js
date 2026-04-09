/**
 * Admin Controller
 * 
 * Administrative endpoints for database seeding and maintenance
 * NOTE: In production, these should be protected with admin authentication
 */

const mongoose = require('mongoose');
const Opportunity = require('../opportunities/Opportunity.Model');
const RefreshRun = require('../../models/RefreshRun');
const CareerAnalytics = require('../../models/CareerAnalytics');
const { sendSuccess, sendError } = require('../../utils/response');
const logger = require('../../utils/logger');
const { extractSkillsEnhanced } = require('../../utils/skillExtractors');
const { fetchAndSaveJobs } = require('../../services/jobAPIService');
const { fetchAllFeeds } = require('../../services/rssFeedService');
const { getCareerTaxonomy, setCareerTaxonomy } = require('../../services/taxonomyService');

/**
 * Seed opportunities database
 * POST /api/admin/seed-opportunities
 */
exports.seedOpportunities = async (req, res, next) => {
  try {
    logger.info('Admin: Seeding opportunities database');
    
    // Import the seed script
    const { opportunities, seedOpportunities } = require('../../../scripts/seedOpportunities');
    
    // Run the seeding function
    const result = await seedOpportunities();
    
    sendSuccess(res, {
      message: 'Opportunities seeded successfully',
      count: result?.count || opportunities.length,
      new: result?.new || 0,
      skipped: result?.skipped || 0
    });
  } catch (error) {
    logger.error('Admin: Error seeding opportunities', error);
    sendError(res, error.message || 'Failed to seed opportunities', 500);
  }
};

/**
 * Get database statistics
 * GET /api/admin/stats
 */
exports.getStats = async (req, res, next) => {
  try {
    const opportunityCount = await Opportunity.countDocuments({ isActive: true });
    const totalOpportunities = await Opportunity.countDocuments();
    const topCareers = await CareerAnalytics.find({})
      .sort({ count: -1 })
      .limit(10)
      .lean();
    
    sendSuccess(res, {
      activeOpportunities: opportunityCount,
      totalOpportunities: totalOpportunities,
      topCareers,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Admin: Error getting stats', error);
    sendError(res, error.message || 'Failed to get statistics', 500);
  }
};

/**
 * Get career taxonomy
 * GET /api/admin/career-taxonomy
 */
exports.getCareerTaxonomy = async (req, res, next) => {
  try {
    const taxonomy = await getCareerTaxonomy();
    sendSuccess(res, { taxonomy });
  } catch (error) {
    logger.error('Admin: Error getting career taxonomy', error);
    sendError(res, error.message || 'Failed to get career taxonomy', 500);
  }
};

/**
 * Update career taxonomy
 * PUT /api/admin/career-taxonomy
 */
exports.updateCareerTaxonomy = async (req, res, next) => {
  try {
    const incoming = req.body?.taxonomy;
    if (!incoming || typeof incoming !== 'object') {
      return sendError(res, 'taxonomy is required and must be an object', 400);
    }

    const saved = await setCareerTaxonomy(incoming);
    sendSuccess(res, { taxonomy: saved });
  } catch (error) {
    logger.error('Admin: Error updating career taxonomy', error);
    sendError(res, error.message || 'Failed to update career taxonomy', 500);
  }
};

/**
 * Refresh opportunities and backfill skills
 * POST /api/admin/refresh-opportunities
 */
async function performRefresh({ runBackfill, runFetch, triggeredBy }) {
  const startedAt = new Date();
  let refreshRecord;
  let backfill = { processed: 0, updated: 0 };
  let fetch = {
    jobApis: { new: 0, skipped: 0, total: 0 },
    rss: { new: 0, skipped: 0, errors: 0 }
  };

  try {
    if (runBackfill) {
      const cursor = Opportunity.find({ isActive: true }).cursor();
      const bulkOps = [];

      for await (const opp of cursor) {
        backfill.processed += 1;
        const baseText = `${opp.title || ''} ${opp.company || ''} ${opp.description || ''}`;
        const extracted = extractSkillsEnhanced(baseText);
        if (extracted.length === 0) continue;

        const existing = Array.isArray(opp.skills) ? opp.skills : [];
        const merged = Array.from(new Set([...existing, ...extracted])).slice(0, 12);

        if (merged.length !== existing.length ||
            merged.some((skill, idx) => skill !== existing[idx])) {
          bulkOps.push({
            updateOne: {
              filter: { _id: opp._id },
              update: { $set: { skills: merged } }
            }
          });
          backfill.updated += 1;
        }

        if (bulkOps.length >= 500) {
          await Opportunity.bulkWrite(bulkOps);
          bulkOps.length = 0;
        }
      }

      if (bulkOps.length > 0) {
        await Opportunity.bulkWrite(bulkOps);
      }
    }

    if (runFetch) {
      try {
        fetch.jobApis = await fetchAndSaveJobs();
      } catch (error) {
        logger.error('Admin: Error fetching job APIs', error);
      }

      try {
        fetch.rss = await fetchAllFeeds();
      } catch (error) {
        logger.error('Admin: Error fetching RSS feeds', error);
      }
    }

    const finishedAt = new Date();
    const durationMs = finishedAt.getTime() - startedAt.getTime();
    refreshRecord = await RefreshRun.create({
      startedAt,
      finishedAt,
      durationMs,
      triggeredBy,
      backfill,
      fetch,
      status: 'success'
    });

    logger.info('Admin: Refresh completed', {
      triggeredBy,
      durationMs,
      backfill,
      fetch
    });

    return {
      message: 'Refresh completed',
      backfill,
      fetch,
      refreshId: refreshRecord?._id
    };
  } catch (error) {
    logger.error('Admin: Error refreshing opportunities', error);
    try {
      const finishedAt = new Date();
      const durationMs = finishedAt.getTime() - startedAt.getTime();
      refreshRecord = await RefreshRun.create({
        startedAt,
        finishedAt,
        durationMs,
        triggeredBy,
        status: 'error',
        error: error.message || 'Unknown error'
      });
    } catch (writeError) {
      logger.error('Admin: Error recording refresh run', writeError);
    }
    throw error;
  }
}

exports.refreshOpportunities = async (req, res, next) => {
  const runBackfill = req.body?.backfill !== false;
  const runFetch = req.body?.fetch !== false;
  const asyncMode = req.body?.async === true || req.query?.async === 'true';
  const triggeredBy = req.refreshTriggeredBy || 'admin';

  if (asyncMode) {
    sendSuccess(res, {
      message: 'Refresh queued',
      backfill: runBackfill,
      fetch: runFetch
    }, 202);

    setImmediate(() => {
      performRefresh({ runBackfill, runFetch, triggeredBy })
        .catch(error => logger.error('Admin: Async refresh failed', error));
    });

    return;
  }

  try {
    const result = await performRefresh({ runBackfill, runFetch, triggeredBy });
    sendSuccess(res, result);
  } catch (error) {
    sendError(res, error.message || 'Failed to refresh opportunities', 500);
  }
};
