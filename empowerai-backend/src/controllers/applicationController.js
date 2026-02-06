const Application = require('../models/Application');
const Opportunity = require('../models/Opportunity');
const logger = require('../utils/logger');

exports.createApplication = async (req, res, next) => {
  try {
    const { opportunityId } = req.body;
    if (!opportunityId) {
      return res.status(400).json({
        status: 'error',
        message: 'opportunityId is required'
      });
    }

    const opportunity = await Opportunity.findById(opportunityId).lean();
    if (!opportunity) {
      return res.status(404).json({
        status: 'error',
        message: 'Opportunity not found'
      });
    }

    const existing = await Application.findOne({ userId: req.user.id, opportunityId });
    if (existing) {
      return res.status(200).json({
        status: 'success',
        data: {
          application: existing,
          created: false
        }
      });
    }

    const application = await Application.create({
      userId: req.user.id,
      opportunityId,
      source: opportunity.source || 'manual',
      applicationUrl: opportunity.applicationUrl || ''
    });

    logger.info('Application tracked', {
      correlationId: req.correlationId,
      userId: req.user.id,
      opportunityId
    });

    return res.status(201).json({
      status: 'success',
      data: {
        application,
        created: true
      }
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(200).json({
        status: 'success',
        data: {
          created: false
        }
      });
    }
    next(error);
  }
};

exports.getMyApplications = async (req, res, next) => {
  try {
    const applications = await Application.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .populate('opportunityId')
      .lean();

    res.status(200).json({
      status: 'success',
      results: applications.length,
      data: {
        applications
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.getMyApplicationStats = async (req, res, next) => {
  try {
    const total = await Application.countDocuments({ userId: req.user.id });
    res.status(200).json({
      status: 'success',
      data: {
        total
      }
    });
  } catch (error) {
    next(error);
  }
};
