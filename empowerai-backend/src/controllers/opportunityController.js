const Opportunity = require('../models/Opportunity');
const logger = require('../utils/logger');
const { getMatchedOpportunities, extractUserProfile } = require('../services/opportunityMatchingService');

exports.getAllOpportunities = async (req, res, next) => {
  try {
    const { province, type, skills, minScore } = req.query;
    
    // First, check total count in database for debugging
    const totalCount = await Opportunity.countDocuments({});
    const activeCount = await Opportunity.countDocuments({ isActive: true });
    
    logger.info('Opportunities query started', { 
      totalCount,
      activeCount,
      queryParams: { province, type, skills, minScore }
    });
    
    let filter = { isActive: true };
    
    // Province filter: province is an array field, check if array contains the value
    if (province) {
      // MongoDB will match if the array contains this value
      filter.province = province;
    }
    
    // Type filter: exact match (only if not 'all')
    if (type && type !== 'all') {
      filter.type = type;
    }
    
    // Skills filter: check if skills array contains any of the provided skills (case-insensitive)
    if (skills) {
      const skillArray = skills.split(',').map(s => s.trim()).filter(s => s);
      if (skillArray.length > 0) {
        // Use regex for case-insensitive matching
        filter.skills = { 
          $in: skillArray.map(skill => new RegExp(skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'))
        };
      }
    }

    logger.info('Opportunities filter applied', { filter: JSON.stringify(filter) });

    // Sort by most recent first, no limit to see all opportunities
    const opportunities = await Opportunity.find(filter)
      .sort({ createdAt: -1 })
      .lean(); // Use lean() for better performance and to get plain JS objects

    // Apply smart matching if user profile available
    let processedOpportunities = opportunities;
    
    const userProfile = extractUserProfile(req);
    if (userProfile && (skills || province || minScore)) {
      userProfile.minMatchScore = minScore ? parseInt(minScore) : 30;
      processedOpportunities = await getMatchedOpportunities(opportunities, userProfile);
      
      logger.info('Smart matching applied', {
        beforeMatching: opportunities.length,
        afterMatching: processedOpportunities.length,
        averageScore: processedOpportunities.length > 0 
          ? Math.round(processedOpportunities.reduce((sum, o) => sum + o.matchScore, 0) / processedOpportunities.length)
          : 0
      });
    }

    logger.info('Opportunities fetched successfully', { 
      count: processedOpportunities.length,
      totalInDB: totalCount,
      activeInDB: activeCount,
      filterApplied: JSON.stringify(filter),
      sampleTitles: processedOpportunities.slice(0, 3).map(o => o.title)
    });

    res.status(200).json({
      status: 'success',
      results: processedOpportunities.length,
      meta: {
        totalInDatabase: activeCount,
        filtered: processedOpportunities.length,
        dataSource: 'real opportunities from Adzuna, Indeed, and job boards',
        lastUpdated: new Date().toISOString()
      },
      data: {
        opportunities: processedOpportunities
      }
    });
  } catch (error) {
    logger.error('Error fetching opportunities', {
      error: error.message,
      stack: error.stack,
      name: error.name
    });
    next(error);
  }
};

exports.getOpportunity = async (req, res, next) => {
  try {
    const opportunity = await Opportunity.findById(req.params.id);

    if (!opportunity) {
      return res.status(404).json({
        status: 'error',
        message: 'Opportunity not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        opportunity
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Debug endpoint: Get database statistics
 * GET /api/opportunities/debug/stats
 */
exports.getDebugStats = async (req, res, next) => {
  try {
    const totalCount = await Opportunity.countDocuments({});
    const activeCount = await Opportunity.countDocuments({ isActive: true });
    const inactiveCount = await Opportunity.countDocuments({ isActive: false });
    
    // Get sample opportunities
    const samples = await Opportunity.find({ isActive: true })
      .limit(5)
      .select('title company type province isActive createdAt')
      .lean();
    
    // Count by type
    const byType = await Opportunity.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$type', count: { $sum: 1 } } }
    ]);
    
    res.status(200).json({
      status: 'success',
      data: {
        totalCount,
        activeCount,
        inactiveCount,
        byType,
        samples,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    logger.error('Error getting debug stats', error);
    next(error);
  }
};