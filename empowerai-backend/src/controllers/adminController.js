/**
 * Admin Controller
 * 
 * Administrative endpoints for database seeding and maintenance
 * NOTE: In production, these should be protected with admin authentication
 */

const mongoose = require('mongoose');
const Opportunity = require('../models/Opportunity');
const { sendSuccess, sendError } = require('../utils/response');
const logger = require('../utils/logger');

/**
 * Seed opportunities database
 * POST /api/admin/seed-opportunities
 */
exports.seedOpportunities = async (req, res, next) => {
  try {
    logger.info('Admin: Seeding opportunities database');
    
    // Import the seed script
    const { opportunities, seedOpportunities } = require('../../scripts/seedOpportunities');
    
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
    
    sendSuccess(res, {
      activeOpportunities: opportunityCount,
      totalOpportunities: totalOpportunities,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Admin: Error getting stats', error);
    sendError(res, error.message || 'Failed to get statistics', 500);
  }
};
