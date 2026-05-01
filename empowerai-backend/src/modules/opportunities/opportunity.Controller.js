const Opportunity = require('./Opportunity.Model');
const logger = require('../../utils/logger');
const { getMatchedOpportunities, extractUserProfile } = require('./opportunityMatchingService');
const { getCareerTaxonomy } = require('../../services/taxonomyService');
const cvProfileRepository = require('../cvAnalyser/cvAnalyser.Repository');

let lastAutoSeedAttemptMs = 0;

exports.getAllOpportunities = async (req, res, next) => {
  try {
    const { province, type, skills, minScore, page, limit, sort, q } = req.query;
    
    // First, check total count in database for debugging
    let totalCount = await Opportunity.countDocuments({});
    let activeCount = await Opportunity.countDocuments({ isActive: true });
    let seededDefaults = false;

    // If the DB is empty (or has no active opportunities), opportunistically seed defaults.
    // This makes the Opportunities page usable even when startup tasks didn't run (or the DB was provisioned empty).
    if (activeCount === 0 && Date.now() - lastAutoSeedAttemptMs > 30_000) {
      lastAutoSeedAttemptMs = Date.now();
      try {
        // Reuse the curated defaults from the seed script (without deleting anything).
        // Path is relative to this controller file: src/modules/opportunities -> ../../../scripts
        // eslint-disable-next-line global-require
        const { opportunities: defaultOpportunities } = require('../../../scripts/seedOpportunities');
        if (Array.isArray(defaultOpportunities) && defaultOpportunities.length > 0) {
          await Opportunity.insertMany(defaultOpportunities, { ordered: false });
          logger.info('Auto-seeded default opportunities (collection was empty)');
          seededDefaults = true;
          totalCount = await Opportunity.countDocuments({});
          activeCount = await Opportunity.countDocuments({ isActive: true });
        }
      } catch (seedError) {
        // BulkWriteError (ordered:false) still throws even if some docs inserted —
        // re-check the count so we don't skip the query when partial inserts succeeded.
        logger.warn('Auto-seed attempt had errors (non-fatal)', { message: seedError?.message });
        try {
          totalCount = await Opportunity.countDocuments({});
          activeCount = await Opportunity.countDocuments({ isActive: true });
          if (activeCount > 0) seededDefaults = true;
        } catch (_) { /* ignore secondary count failure */ }
      }
    }
    
    logger.info('Opportunities query started', { 
      totalCount,
      activeCount,
      seededDefaults,
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

    // If authenticated and the user profile has no skills yet, hydrate from their stored CV profile.
    if (req.user && (!Array.isArray(userProfile.skills) || userProfile.skills.length === 0)) {
      try {
        const cvProfile = await cvProfileRepository.findByUserId(req.user.id);
        const cvSkills = cvProfile?.analysis?.extractedSkills;
        if (Array.isArray(cvSkills) && cvSkills.length > 0) {
          userProfile.skills = cvSkills;
        }
      } catch (e) {
        logger.warn('Failed to hydrate user skills from CV profile (non-fatal)', { message: e?.message });
      }
    }
    const hasCareerFilter = careerTerms.length > 0;
    const hasSearchQuery = typeof q === 'string' && q.trim().length > 0;

    const hasProfileSignals =
      (Array.isArray(userProfile.skills) && userProfile.skills.length > 0) ||
      (Array.isArray(userProfile.careerGoals) && userProfile.careerGoals.length > 0) ||
      !!userProfile.province;

    // For authenticated users, default to matched results when we have enough signals.
    const matchingActive =
      userProfile &&
      (skills || province || minScore || hasCareerFilter || hasSearchQuery || (req.user && hasProfileSignals));

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
        // 25 is the lowest score a single-skill match can produce after the baseline boost,
        // so this threshold lets any partial match through rather than returning 0.
        userProfile.minMatchScore = hasUserSkills ? 25 : 15;
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

      // Fallback: if smart matching yields zero, show all active opportunities unless the user
      // explicitly narrowed by a free-text search or province (those are intentional hard filters).
      if (
        processedOpportunities.length === 0 &&
        !hasSearchQuery &&
        !province &&
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
