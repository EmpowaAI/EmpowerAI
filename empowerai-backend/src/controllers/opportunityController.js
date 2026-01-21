const Opportunity = require('../models/Opportunity');
const logger = require('../utils/logger');

exports.getAllOpportunities = async (req, res, next) => {
  try {
    const { province, type, skills } = req.query;
    
    let filter = { isActive: true };
    
    // Province filter: province is an array field, so check if it contains the value
    if (province) {
      filter.province = province; // MongoDB will check if array contains this value
    }
    
    // Type filter: exact match
    if (type && type !== 'all') {
      filter.type = type;
    }
    
    // Skills filter: check if skills array contains any of the provided skills (case-insensitive)
    if (skills) {
      const skillArray = skills.split(',').map(s => s.trim()).filter(s => s);
      if (skillArray.length > 0) {
        // Use regex for case-insensitive matching
        filter.skills = { 
          $in: skillArray.map(skill => new RegExp(skill, 'i'))
        };
      }
    }

    // Sort by most recent first
    const opportunities = await Opportunity.find(filter)
      .sort({ createdAt: -1 })
      .limit(100); // Limit to 100 most recent opportunities

    logger.info('Opportunities fetched', { 
      count: opportunities.length, 
      filters: filter,
      hasProvince: !!province,
      hasType: !!type,
      hasSkills: !!skills
    });

    res.status(200).json({
      status: 'success',
      results: opportunities.length,
      data: {
        opportunities
      }
    });
  } catch (error) {
    logger.error('Error fetching opportunities', error);
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