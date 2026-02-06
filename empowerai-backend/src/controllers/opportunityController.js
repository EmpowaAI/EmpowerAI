const Opportunity = require('../models/Opportunity');
const logger = require('../utils/logger');
const { getMatchedOpportunities, extractUserProfile } = require('../services/opportunityMatchingService');

exports.getAllOpportunities = async (req, res, next) => {
  try {
    const { province, type, skills, minScore, page, limit, sort, q } = req.query;
    
    // First, check total count in database for debugging
    const totalCount = await Opportunity.countDocuments({});
    const activeCount = await Opportunity.countDocuments({ isActive: true });
    
    logger.info('Opportunities query started', { 
      totalCount,
      activeCount,
      queryParams: { province, type, skills, minScore, page, limit, sort, q }
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

    // Career filter: match selected career goals against title/description/company/skills
    const careerQuery =
      req.query.career ||
      req.query.careerGoal ||
      req.query.careerGoals ||
      req.query.interests;

    const userCareerGoals = Array.isArray(req.user?.interests) ? req.user.interests : [];

    const careerTaxonomy = {
      'Tech Career': ['software', 'developer', 'engineer', 'data', 'it', 'cyber', 'cloud', 'devops', 'ai', 'ml', 'web', 'mobile'],
      'Freelancing': ['freelance', 'contract', 'gig', 'remote', 'self-employed'],
      'Corporate Job': ['corporate', 'office', 'graduate program', 'management', 'analyst', 'coordinator'],
      'Entrepreneurship': ['entrepreneur', 'startup', 'founder', 'business owner', 'small business'],
      'Creative Industry': ['design', 'graphic', 'ui', 'ux', 'content', 'writer', 'video', 'photography', 'marketing'],
      'Finance': ['finance', 'accounting', 'banking', 'audit', 'tax', 'investment', 'financial'],
      'Healthcare': ['health', 'medical', 'nurse', 'clinic', 'pharmacy', 'care'],
      'Education': ['teacher', 'education', 'tutor', 'training', 'facilitator', 'lecturer']
    };

    const expandCareerTerms = (terms) => {
      const expanded = [];
      for (const term of terms) {
        expanded.push(term);
        if (careerTaxonomy[term]) {
          expanded.push(...careerTaxonomy[term]);
        }
      }
      return expanded;
    };

    const baseCareerTerms = []
      .concat(
        typeof careerQuery === 'string'
          ? careerQuery.split(',').map(s => s.trim())
          : [],
        userCareerGoals
      )
      .filter(Boolean);

    const careerTerms = expandCareerTerms(baseCareerTerms);

    if (careerTerms.length > 0) {
      const careerRegexes = careerTerms.map(term =>
        new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i')
      );

      filter.$or = [
        { title: { $in: careerRegexes } },
        { description: { $in: careerRegexes } },
        { company: { $in: careerRegexes } },
        { skills: { $in: careerRegexes } }
      ];
    }

    // Text search filter (q) across title/company/description/location
    if (q && typeof q === 'string' && q.trim().length > 0) {
      const qRegexes = q
        .split(' ')
        .map(s => s.trim())
        .filter(Boolean)
        .map(term => new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'));

      const qOr = [
        { title: { $in: qRegexes } },
        { description: { $in: qRegexes } },
        { company: { $in: qRegexes } },
        { location: { $in: qRegexes } }
      ];

      if (filter.$or) {
        filter.$and = [
          { $or: filter.$or },
          { $or: qOr }
        ];
        delete filter.$or;
      } else {
        filter.$or = qOr;
      }
    }

    logger.info('Opportunities filter applied', { filter: JSON.stringify(filter) });

    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const limitNum = Math.min(Math.max(parseInt(limit, 10) || 30, 1), 100);
    const skip = (pageNum - 1) * limitNum;

    const totalFiltered = await Opportunity.countDocuments(filter);

    let sortSpec = { createdAt: -1 };
    if (sort === 'deadline') sortSpec = { deadline: 1 };
    if (sort === 'company') sortSpec = { company: 1 };

    // Sort by most recent first by default
    const opportunities = await Opportunity.find(filter)
      .sort(sortSpec)
      .skip(skip)
      .limit(limitNum)
      .lean(); // Use lean() for better performance and to get plain JS objects

    // Apply smart matching if user profile available
    let processedOpportunities = opportunities;
    
    const userProfile = extractUserProfile(req);
    const hasCareerFilter = careerTerms.length > 0;
    const hasSearchQuery = typeof q === 'string' && q.trim().length > 0;
    if (userProfile && (skills || province || minScore || hasCareerFilter || hasSearchQuery)) {
      userProfile.minMatchScore = minScore ? parseInt(minScore) : 0;
      if (careerTerms.length > 0) {
        userProfile.careerGoals = careerTerms;
      }
      processedOpportunities = await getMatchedOpportunities(opportunities, userProfile);
      
      logger.info('Smart matching applied', {
        beforeMatching: opportunities.length,
        afterMatching: processedOpportunities.length,
        averageScore: processedOpportunities.length > 0 
          ? Math.round(processedOpportunities.reduce((sum, o) => sum + o.matchScore, 0) / processedOpportunities.length)
          : 0
      });
    }

    // Relevance scoring for q/career terms when requested
    const relevanceTerms = []
      .concat(
        careerTerms || [],
        typeof q === 'string' ? q.split(' ').map(s => s.trim()).filter(Boolean) : []
      )
      .filter(Boolean);

    if (relevanceTerms.length > 0) {
      processedOpportunities = processedOpportunities.map(opp => {
        const haystack = [
          opp.title,
          opp.company,
          opp.description,
          opp.location,
          Array.isArray(opp.skills) ? opp.skills.join(' ') : ''
        ].join(' ').toLowerCase();

        const relevanceScore = relevanceTerms.reduce((acc, term) => {
          const t = term.toLowerCase();
          if (!t) return acc;
          return acc + (haystack.includes(t) ? 1 : 0);
        }, 0);

        return { ...opp, relevanceScore };
      });
    }

    if (sort === 'relevance' && relevanceTerms.length > 0) {
      processedOpportunities.sort((a, b) => {
        if ((b.relevanceScore || 0) !== (a.relevanceScore || 0)) {
          return (b.relevanceScore || 0) - (a.relevanceScore || 0);
        }
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
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
        totalFiltered,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.max(Math.ceil(totalFiltered / limitNum), 1),
        hasMore: pageNum * limitNum < totalFiltered,
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
