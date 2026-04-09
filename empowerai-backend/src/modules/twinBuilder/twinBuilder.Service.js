/**
 * EconomicTwin Service
 * Builds and updates Economic Twin from CV analysis + AI enrichment
 */

const twinRepository = require('./twinBuilder.Repository');
const cvProfileRepository = require('../cvAnalyser/cvAnalyser.Repository');
const { AppError } = require('../../utils/errors');

// -----------------------------------------------------------------------------
// SAFE ENUMS (MATCH YOUR MONGOOSE SCHEMA)
// -----------------------------------------------------------------------------

const EVOLUTION_SOURCE = {
  CV_ANALYZER: 'cv_analyzer',
  AI_ENRICHMENT: 'ai_enrichment',
};

// -----------------------------------------------------------------------------
// CV MAPPER (BASE TRUTH)
// -----------------------------------------------------------------------------

const mapCvProfileToTwin = (cv) => ({
  cvProfile: cv._id,

  identity: {
    currentRole: cv.currentRole || 'UNDEFINED',
    targetRole: cv.targetRole || 'UNDEFINED',
    seniorityLevel: cv.seniorityLevel || 'ENTRY',
    industry: cv.industry || 'general',
  },

  skills: {
    core: cv.extractedSkills || [],
    missing: cv.missingSkills || [],
    emerging: [],
    monetizable: [],
  },

  economy: {
    employabilityScore: cv.employabilityScore || 0,
    marketValueScore: 0,
    demandLevel: 'LOW',
    incomePotentialRange: {
      min: 0,
      max: 0,
      currency: 'ZAR',
    },
  },

  intelligence: {
    strengths: cv.strengths || [],
    weaknesses: cv.weaknesses || [],
    opportunities: [],
    threats: [],
    recommendations: cv.recommendations || [],
  },

  market: {
    trendingSkills: [],
    decliningSkills: [],
    jobTitlesMapped: [],
    competitorRoles: [],
  },

  evolution: {
    version: 1,
    lastUpdatedBy: EVOLUTION_SOURCE.CV_ANALYZER,
    confidenceScore: cv.confidenceScore || 0,
  },

  status: 'ACTIVE',
  lastCalculatedAt: new Date(),
});

// -----------------------------------------------------------------------------
// AI MAPPER (ENRICHMENT LAYER)
// -----------------------------------------------------------------------------

const mapAiResponseToTwin = (ai = {}) => {
  const income = ai.incomeProjection || {};
  const market = ai.market || {};
  const growth = ai.growthModel || {};

  return {
    skills: {
      core: ai.extractedSkills || [],
      missing: ai.missingSkills || [],
      emerging: ai.emergingSkills || [],
      monetizable: ai.monetizable || [],
    },

    economy: {
      employabilityScore: ai.employabilityScore || 0,
      marketValueScore: ai.marketValueScore || 0,
      demandLevel: ai.demandLevel || 'LOW',
      incomePotentialRange: {
        min: income.min || income.threeMonth || 0,
        max: income.max || income.twelveMonth || 0,
        currency: income.currency || 'ZAR',
      },
    },

    market: {
      trendingSkills: market.trendingSkills || [],
      decliningSkills: market.decliningSkills || [],
      jobTitlesMapped:
        market.jobTitlesMapped ||
        growth?.recommendedPaths?.map((p) => p.name) ||
        [],
      competitorRoles: market.competitorRoles || [],
    },

    intelligence: {
      strengths: ai.strengths || [],
      weaknesses: ai.weaknesses || [],
      opportunities: ai.opportunities || [],
      threats: ai.threats || [],
      recommendations: ai.recommendations || [],
    },

    evolution: {
      lastUpdatedBy: EVOLUTION_SOURCE.AI_ENRICHMENT,
      confidenceScore: ai.confidenceScore || 0,
    },
  };
};

// -----------------------------------------------------------------------------
// SAFE DEEP MERGE (CRITICAL FIX)
// -----------------------------------------------------------------------------

const deepMerge = (base, update) => {
  const output = JSON.parse(JSON.stringify(base));

  for (const key in update) {
    if (
      update[key] &&
      typeof update[key] === 'object' &&
      !Array.isArray(update[key])
    ) {
      output[key] = {
        ...output[key],
        ...update[key],
      };
    } else {
      output[key] = update[key];
    }
  }

  return output;
};

// -----------------------------------------------------------------------------
// BUILD FROM CV PROFILE ONLY
// -----------------------------------------------------------------------------

const buildFromCvProfile = async (userId) => {
  const cv = await cvProfileRepository.findByUserId(userId);

  if (!cv) {
    throw new AppError('CV profile not found', 404);
  }

  const twin = mapCvProfileToTwin(cv);

  return await twinRepository.upsertTwin(userId, twin);
};

// -----------------------------------------------------------------------------
// BUILD FROM FULL ANALYSIS (CV + AI)
// -----------------------------------------------------------------------------

const buildFromAnalysis = async (analysis, userId) => {
  if (!analysis) {
    throw new AppError('No analysis data provided', 400);
  }

  // 1. Extract CV + AI safely
  const cv = analysis.cvProfile || analysis;
  const ai = analysis.aiData || analysis;

  // 2. Build base twin
  const baseTwin = mapCvProfileToTwin(cv);

  // 3. Build AI enrichment
  const aiTwin = mapAiResponseToTwin(ai);

  // 4. Merge safely (no overwrites)
  const finalTwin = deepMerge(baseTwin, aiTwin);

  // 5. Ensure timestamps + version safety
  finalTwin.lastCalculatedAt = new Date();

  // 6. Persist
  return await twinRepository.upsertTwin(userId, finalTwin);
};

// -----------------------------------------------------------------------------
// EXPORTS
// -----------------------------------------------------------------------------

module.exports = {
  buildFromAnalysis,
  buildFromCvProfile,
  mapCvProfileToTwin,
  mapAiResponseToTwin,
};