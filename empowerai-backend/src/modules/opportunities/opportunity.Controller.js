const supabase = require('../../db/supabase');
const logger = require('../../utils/logger');
const { getMatchedOpportunities, extractUserProfile } = require('./opportunityMatchingService');
const { getCareerTaxonomy } = require('../../services/taxonomyService');
const cvRepository = require('../cvAnalyser/cvAnalyser.Repository');

// Normalize a Supabase row to the shape the frontend expects (camelCase)
function fromRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    title: row.title,
    type: row.type,
    company: row.company,
    location: row.location,
    province: row.province,
    description: row.description,
    requirements: row.requirements,
    skills: row.skills,
    salaryRange: row.salary_range,
    deadline: row.deadline,
    applicationUrl: row.application_url,
    isActive: row.is_active,
    source: row.source,
    externalId: row.external_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function buildQuery(filters) {
  const { province, type, q } = filters;
  let q_ = supabase.from('opportunities').select('*').eq('is_active', true);

  if (province) q_ = q_.contains('province', [province]);
  if (type && type !== 'all') q_ = q_.eq('type', type);

  if (q && q.trim().length > 0) {
    const term = q.trim().replace(/'/g, "''");
    q_ = q_.or(
      `title.ilike.%${term}%,description.ilike.%${term}%,company.ilike.%${term}%,location.ilike.%${term}%`
    );
  }

  return q_;
}

exports.getAllOpportunities = async (req, res, next) => {
  try {
    const { province, type, skills, minScore, page, limit, sort, q } = req.query;

    const pageNum  = Math.max(parseInt(page,  10) || 1,  1);
    const limitNum = Math.min(Math.max(parseInt(limit, 10) || 30, 1), 100);
    const skip = (pageNum - 1) * limitNum;

    // ─── Active count for meta ────────────────────────────────────────────────
    const { count: activeCount } = await supabase
      .from('opportunities').select('id', { count: 'exact', head: true }).eq('is_active', true);

    // ─── Career term expansion ────────────────────────────────────────────────
    const careerQuery = req.query.career || req.query.careerGoal || req.query.careerGoals || req.query.interests;
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
          if (Array.isArray(entry.terms)) expanded.push(...entry.terms);
          if (Array.isArray(entry.boostSkills)) entry.boostSkills.forEach(s => boostSkills.add(s));
          if (entry.strict) strict = true;
        }
      }
      return { terms: expanded, boostSkills: Array.from(boostSkills), strict };
    };

    const baseCareerTerms = []
      .concat(typeof careerQuery === 'string' ? careerQuery.split(',').map(s => s.trim()) : [], userCareerGoals)
      .filter(Boolean);
    const careerExpansion = expandCareerTerms(baseCareerTerms);
    const careerTerms = careerExpansion.terms;

    // ─── Sort ─────────────────────────────────────────────────────────────────
    const sortCol = sort === 'deadline' ? 'deadline' : sort === 'company' ? 'company' : 'created_at';
    const sortAsc  = sort === 'deadline' || sort === 'company';

    // ─── User profile for smart matching ─────────────────────────────────────
    const userProfile = extractUserProfile(req);

    if (req.user && (!Array.isArray(userProfile.skills) || userProfile.skills.length === 0)) {
      try {
        // Go through the repository so analysis.extractedSkills is decrypted.
        // A raw select returns it as an encrypted string, so the old
        // Array.isArray check silently never matched.
        const cvProfile = await cvRepository.findByUserId(req.user.id);
        const cvSkills = cvProfile?.analysis?.extractedSkills;
        if (Array.isArray(cvSkills) && cvSkills.length > 0) userProfile.skills = cvSkills;
      } catch (e) {
        logger.warn('Failed to hydrate skills from CV profile (non-fatal)', { message: e?.message });
      }
    }

    const hasCareerFilter  = careerTerms.length > 0;
    const hasSearchQuery   = typeof q === 'string' && q.trim().length > 0;
    const hasProfileSignals =
      (Array.isArray(userProfile.skills)      && userProfile.skills.length > 0) ||
      (Array.isArray(userProfile.careerGoals) && userProfile.careerGoals.length > 0) ||
      !!userProfile.province;

    const matchingActive =
      userProfile &&
      (skills || province || minScore || hasCareerFilter || hasSearchQuery || (req.user && hasProfileSignals));

    let processedOpportunities = [];
    let effectiveTotal = activeCount || 0;
    const strictMatch = process.env.OPPORTUNITY_STRICT_MATCH === 'true';

    if (matchingActive) {
      const poolLimit = Math.min(Math.max(limitNum * 5, 100), 500);
      const { data: poolRows } = await buildQuery({ province, type, q })
        .order(sortCol, { ascending: sortAsc })
        .limit(poolLimit);
      const pool = (poolRows || []).map(fromRow);

      const hasUserSkills = Array.isArray(userProfile.skills) && userProfile.skills.length > 0;
      userProfile.minMatchScore = minScore
        ? parseInt(minScore)
        : strictMatch ? (hasUserSkills ? 60 : 25) : (hasUserSkills ? 35 : 15);

      if (careerTerms.length > 0) userProfile.careerGoals = careerTerms;
      if (careerExpansion.boostSkills.length > 0) userProfile.boostSkills = careerExpansion.boostSkills;
      userProfile.strictCareerMatch = req.query.strictCareer === 'true' || careerExpansion.strict;

      processedOpportunities = await getMatchedOpportunities(pool, userProfile);

      logger.info('Smart matching applied', {
        beforeMatching: pool.length,
        afterMatching: processedOpportunities.length,
      });

      if (processedOpportunities.length === 0 && !hasSearchQuery && !province && !strictMatch) {
        const { data: fallbackRows } = await buildQuery({ province, type, q })
          .order(sortCol, { ascending: sortAsc })
          .range(skip, skip + limitNum - 1);
        processedOpportunities = (fallbackRows || []).map(fromRow);
      }
    } else {
      const { data: rows } = await buildQuery({ province, type, q })
        .order(sortCol, { ascending: sortAsc })
        .range(skip, skip + limitNum - 1);
      processedOpportunities = (rows || []).map(fromRow);
    }

    // ─── Relevance scoring ────────────────────────────────────────────────────
    const relevanceTerms = []
      .concat(careerTerms || [], typeof q === 'string' ? q.split(' ').map(s => s.trim()).filter(Boolean) : [])
      .filter(Boolean);

    if (relevanceTerms.length > 0) {
      processedOpportunities = processedOpportunities.map(opp => {
        const haystack = [opp.title, opp.company, opp.description, opp.location,
          Array.isArray(opp.skills) ? opp.skills.join(' ') : ''].join(' ').toLowerCase();
        const relevanceScore = relevanceTerms.reduce((acc, term) => acc + (haystack.includes(term.toLowerCase()) ? 1 : 0), 0);
        return { ...opp, relevanceScore };
      });
    }

    if (sort === 'relevance' && relevanceTerms.length > 0) {
      processedOpportunities.sort((a, b) => {
        if ((b.relevanceScore || 0) !== (a.relevanceScore || 0)) return (b.relevanceScore || 0) - (a.relevanceScore || 0);
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
    }

    // ─── Paginate after matching ──────────────────────────────────────────────
    let pagedOpportunities = processedOpportunities;
    if (matchingActive) {
      effectiveTotal = processedOpportunities.length;
      pagedOpportunities = processedOpportunities.slice(skip, skip + limitNum);
    }

    res.status(200).json({
      status: 'success',
      results: pagedOpportunities.length,
      meta: {
        totalInDatabase: activeCount || 0,
        filtered: pagedOpportunities.length,
        totalFiltered: effectiveTotal,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.max(Math.ceil(effectiveTotal / limitNum), 1),
        hasMore: pageNum * limitNum < effectiveTotal,
        lastUpdated: new Date().toISOString(),
      },
      data: { opportunities: pagedOpportunities },
    });
  } catch (error) {
    logger.error('Error fetching opportunities', { error: error.message });
    next(error);
  }
};

exports.getOpportunity = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('opportunities').select('*').eq('id', req.params.id).single();

    if (error || !data) {
      return res.status(404).json({ status: 'error', message: 'Opportunity not found' });
    }

    res.status(200).json({ status: 'success', data: { opportunity: fromRow(data) } });
  } catch (error) {
    next(error);
  }
};

exports.getDebugStats = async (req, res, next) => {
  try {
    const { count: totalCount } = await supabase
      .from('opportunities').select('id', { count: 'exact', head: true });
    const { count: activeCount } = await supabase
      .from('opportunities').select('id', { count: 'exact', head: true }).eq('is_active', true);

    const { data: typeRows } = await supabase
      .from('opportunities').select('type').eq('is_active', true);
    const byType = (typeRows || []).reduce((acc, { type }) => {
      acc[type || 'unknown'] = (acc[type || 'unknown'] || 0) + 1;
      return acc;
    }, {});

    const { data: samples } = await supabase
      .from('opportunities')
      .select('id, title, company, type, province, is_active, created_at')
      .eq('is_active', true).limit(5);

    res.status(200).json({
      status: 'success',
      data: { totalCount, activeCount, inactiveCount: (totalCount || 0) - (activeCount || 0), byType, samples: (samples || []).map(fromRow), timestamp: new Date().toISOString() },
    });
  } catch (error) {
    logger.error('Error getting debug stats', error);
    next(error);
  }
};
