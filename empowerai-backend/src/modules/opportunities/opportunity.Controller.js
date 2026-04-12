const Opportunity = require('./Opportunity.Model');
const logger = require('../../utils/logger');
const { getMatchedOpportunities, extractUserProfile } = require('./opportunityMatchingService');
const { getCareerTaxonomy } = require('../../services/taxonomyService');

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
    
    // NOTE: Skills are used for matching/scoring, not strict DB filtering.

    // Career filter: match selected career goals against title/description/company/skills
    const careerQuery =
      req.query.career ||
      req.query.careerGoal ||
      req.query.careerGoals ||
      req.query.interests;

    const userCareerGoals = Array.isArray(req.user?.interests) ? req.user.interests : [];

    const taxonomy = await getCareerTaxonomy();

    const expandCareerTerms = (terms) => {
      const expanded = [];
      const boostSkills = new Set();
      let strict = false;

      for (const term of terms) {
        expanded.push(term);
        const entry = taxonomy[term];
        if (entry) {
          if (Array.isArray(entry.terms)) {
            expanded.push(...entry.terms);
          }
          if (Array.isArray(entry.boostSkills)) {
            entry.boostSkills.forEach(skill => boostSkills.add(skill));
          }
          if (entry.strict) {
            strict = true;
          }
        }
      }

      return {
        terms: expanded,
        boostSkills: Array.from(boostSkills),
        strict
      };
    };

    const baseCareerTerms = []
      .concat(
        typeof careerQuery === 'string'
          ? careerQuery.split(',').map(s => s.trim())
          : [],
        userCareerGoals
      )
      .filter(Boolean);

    const careerExpansion = expandCareerTerms(baseCareerTerms);
    const careerTerms = careerExpansion.terms;

    // NOTE: Career goals are used for matching/scoring, not strict DB filtering.

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

    // Apply smart matching if user profile available
    let processedOpportunities = [];
    
    const userProfile = extractUserProfile(req);
    const hasCareerFilter = careerTerms.length > 0;
    const hasSearchQuery = typeof q === 'string' && q.trim().length > 0;
    const matchingActive = userProfile && (skills || province || minScore || hasCareerFilter || hasSearchQuery);

    const strictMatch = process.env.OPPORTUNITY_STRICT_MATCH === 'true';
    if (matchingActive) {
      // Fetch a larger pool, then match + paginate (prevents empty results on strict filters)
      const poolLimit = Math.min(Math.max(limitNum * 5, 100), 500);
      const pool = await Opportunity.find(filter)
        .sort(sortSpec)
        .limit(poolLimit)
        .lean();

      const hasUserSkills = Array.isArray(userProfile.skills) && userProfile.skills.length > 0;
      if (minScore) {
        userProfile.minMatchScore = parseInt(minScore);
      } else if (strictMatch) {
        // In strict mode, allow lower threshold when only career goals are provided
        userProfile.minMatchScore = hasUserSkills ? 60 : 25;
      } else {
        userProfile.minMatchScore = hasUserSkills ? 45 : 20;
      }
      if (careerTerms.length > 0) {
        userProfile.careerGoals = careerTerms;
      }
      if (careerExpansion.boostSkills.length > 0) {
        userProfile.boostSkills = careerExpansion.boostSkills;
      }
      const strictCareerQuery = req.query.strictCareer === 'true';
      userProfile.strictCareerMatch = strictCareerQuery || careerExpansion.strict;

      processedOpportunities = await getMatchedOpportunities(pool, userProfile);

      logger.info('Smart matching applied', {
        beforeMatching: pool.length,
        afterMatching: processedOpportunities.length,
        averageScore: processedOpportunities.length > 0 
          ? Math.round(processedOpportunities.reduce((sum, o) => sum + o.matchScore, 0) / processedOpportunities.length)
          : 0
      });

      // Fallback: if career goal matching yields zero and no explicit skills/search filters, return unfiltered list
      if (
        processedOpportunities.length === 0 &&
        hasCareerFilter &&
        !skills &&
        !hasSearchQuery &&
        !strictMatch
      ) {
        processedOpportunities = await Opportunity.find(filter)
          .sort(sortSpec)
          .skip(skip)
          .limit(limitNum)
          .lean();
      }
    } else {
      // Standard pagination when no matching is applied
      processedOpportunities = await Opportunity.find(filter)
        .sort(sortSpec)
        .skip(skip)
        .limit(limitNum)
        .lean();
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

    // Paginate after matching (if matching was active)
    let pagedOpportunities = processedOpportunities;
    let effectiveTotal = totalFiltered;
    if (matchingActive) {
      effectiveTotal = processedOpportunities.length;
      const start = skip;
      const end = skip + limitNum;
      pagedOpportunities = processedOpportunities.slice(start, end);
    }

    logger.info('Opportunities fetched successfully', { 
      count: pagedOpportunities.length,
      totalInDB: totalCount,
      activeInDB: activeCount,
      filterApplied: JSON.stringify(filter),
      sampleTitles: pagedOpportunities.slice(0, 3).map(o => o.title)
    });

    res.status(200).json({
      status: 'success',
      results: pagedOpportunities.length,
      meta: {
        totalInDatabase: activeCount,
        filtered: pagedOpportunities.length,
        totalFiltered: effectiveTotal,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.max(Math.ceil(effectiveTotal / limitNum), 1),
        hasMore: pageNum * limitNum < effectiveTotal,
        dataSource: 'real opportunities from Adzuna, Indeed, and job boards',
        lastUpdated: new Date().toISOString()
      },
      data: {
        opportunities: pagedOpportunities
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
