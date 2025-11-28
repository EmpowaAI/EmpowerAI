const Opportunity = require('../models/Opportunity');

exports.getAllOpportunities = async (req, res, next) => {
  try {
    const { province, type, skills } = req.query;
    
    let filter = { isActive: true };
    
    if (province) filter.province = { $in: [province] };
    if (type) filter.type = type;
    if (skills) {
      filter.skills = { $in: skills.split(',') };
    }

    const opportunities = await Opportunity.find(filter);

    res.status(200).json({
      status: 'success',
      results: opportunities.length,
      data: {
        opportunities
      }
    });
  } catch (error) {
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