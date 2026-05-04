'use strict';

const cvRepository = require('../cvAnalyser/cvAnalyser.Repository');
const twinRepository = require('./twinBuilder.Repository');
const Opportunity = require('../opportunities/Opportunity.Model');
const logger = require('../../utils/logger');
const aiServiceClient = require('../../intergration/ai/ai.ServiceClient');
const { NotFoundError } = require('../../utils/errors');


// -----------------------------------------------------------------------------
// OPPORTUNITY MATCHING ENGINE
// -----------------------------------------------------------------------------

async function matchOpportunities(analysis) {
  const userSkills = (analysis.extractedSkills || []).map(s => s.toLowerCase());
  const userIndustry = (analysis.industry || '').toLowerCase();
  const userLevel = (analysis.readinessLevel || '').toLowerCase();

  const opportunities = await Opportunity.find({ isActive: true }).lean();

  const scored = opportunities.map((opp) => {
    const oppSkills = (opp.skills || []).map(s => s.toLowerCase());
    const oppReqs = (opp.requirements || []).map(r => r.toLowerCase());

    const skillMatches = oppSkills.filter(s =>
      userSkills.some(us => us.includes(s) || s.includes(us))
    ).length;

    const skillScore = oppSkills.length > 0
      ? (skillMatches / oppSkills.length) * 35
      : 0;

    const industryScore =
      opp.description?.toLowerCase().includes(userIndustry) ||
      opp.title?.toLowerCase().includes(userIndustry)
        ? 20
        : 0;

    const oppTitle = (opp.title || '').toLowerCase();

    const seniorityScore =
      (userLevel.includes('junior') &&
        (oppTitle.includes('junior') || oppTitle.includes('trainee') || oppTitle.includes('intern'))) ||
      (userLevel.includes('mid') && (oppTitle.includes('mid') || oppTitle.includes('intermediate'))) ||
      (userLevel.includes('senior') && oppTitle.includes('senior'))
        ? 15
        : 5;

    const reqMatches = oppReqs.filter(r =>
      userSkills.some(s => r.includes(s))
    ).length;

    const reqScore = oppReqs.length > 0
      ? (reqMatches / oppReqs.length) * 10
      : 0;

    const typeScore = ['job', 'freelance'].includes(opp.type) ? 10 :
      ['internship', 'learnership'].includes(opp.type) ? 7 : 5;

    const salaryScore = opp.salaryRange?.min && opp.salaryRange?.max ? 5 : 0;
    const deadlineScore = !opp.deadline || opp.deadline > new Date() ? 3 : 0;
    const urlScore = opp.applicationUrl ? 2 : 0;

    return {
      opp,
      totalScore:
        skillScore +
        industryScore +
        seniorityScore +
        reqScore +
        typeScore +
        salaryScore +
        deadlineScore +
        urlScore,
    };
  });

  return scored
    .sort((a, b) => b.totalScore - a.totalScore)
    .slice(0, 10)
    .map(({ opp }) => opp);
}


// -----------------------------------------------------------------------------
// DERIVATIONS
// -----------------------------------------------------------------------------

function deriveSeniorityLevel(readinessLevel = '', score = 0) {
  const level = readinessLevel.toLowerCase();

  if (level.includes('senior') || level.includes('lead')) return 'SENIOR';
  if (level.includes('mid') || level.includes('intermediate')) return 'MID';
  if (level.includes('junior') || level.includes('high potential')) return 'JUNIOR';
  if (score >= 75) return 'JUNIOR';
  if (score >= 50) return 'ENTRY';
  return 'ENTRY';
}

function deriveDemandLevel(score = 0, matchedCount = 0) {
  if (score >= 80 && matchedCount >= 7) return 'CRITICAL';
  if (score >= 65 && matchedCount >= 4) return 'HIGH';
  if (score >= 45 && matchedCount >= 2) return 'MEDIUM';
  return 'LOW';
}

function deriveIncomeRange(seniorityLevel, industry = '') {
  const isTech = ['technology', 'software', 'it', 'engineering']
    .some(i => industry.toLowerCase().includes(i));

  const ranges = {
    ENTRY:  isTech ? { min: 8000,  max: 15000 } : { min: 5000,  max: 10000 },
    JUNIOR: isTech ? { min: 15000, max: 28000 } : { min: 10000, max: 18000 },
    MID:    isTech ? { min: 28000, max: 50000 } : { min: 18000, max: 35000 },
    SENIOR: isTech ? { min: 50000, max: 85000 } : { min: 35000, max: 60000 },
    LEAD:   isTech ? { min: 75000, max: 120000 } : { min: 50000, max: 80000 },
  };

  return { ...(ranges[seniorityLevel] || ranges.ENTRY), currency: 'ZAR' };
}


// -----------------------------------------------------------------------------
// SKILLS
// -----------------------------------------------------------------------------

const HIGH_VALUE_SKILLS = [
  'react','node.js','typescript','python','c#','asp.net','.net',
  'azure','aws','docker','kubernetes','fastapi','postgresql',
  'mongodb','graphql','next.js','angular','vue','java','spring',
  'machine learning','ai','data science','devops','ci/cd',
];

function deriveMonetizableSkills(extractedSkills = []) {
  return extractedSkills.filter(skill =>
    HIGH_VALUE_SKILLS.some(h => skill.toLowerCase().includes(h))
  );
}

function deriveEmergingSkills(analysis, matchedOpportunities) {
  const userSkills = new Set((analysis.extractedSkills || []).map(s => s.toLowerCase()));
  const emerging = new Set();

  for (const opp of matchedOpportunities) {
    for (const skill of (opp.skills || [])) {
      if (!userSkills.has(skill.toLowerCase())) {
        emerging.add(skill);
      }
    }
  }

  return [...emerging].slice(0, 10);
}


// -----------------------------------------------------------------------------
// CORE ENGINE (PURE - NO DB)
// -----------------------------------------------------------------------------

async function _assembleTwinData(analysis, userId, cvProfileId) {
  const matchedOpportunities = await matchOpportunities(analysis);

  const seniorityLevel = deriveSeniorityLevel(analysis.readinessLevel, analysis.score);
  const demandLevel = deriveDemandLevel(analysis.score, matchedOpportunities.length);
  const incomePotential = deriveIncomeRange(seniorityLevel, analysis.industry);
  const emergingSkills = deriveEmergingSkills(analysis, matchedOpportunities);
  const monetizableSkills = deriveMonetizableSkills(analysis.extractedSkills);

  const coreSkills = analysis.extractedSkills?.length
    ? analysis.extractedSkills.slice(0, 10)
    : ['communication', 'problem solving'];

  const employabilityScore =
    analysis.score || (50 + (analysis.yearsExperience || 0) * 5);

  const marketValueScore =
    Math.min(100, employabilityScore + matchedOpportunities.length * 3);

  const currentRole =
    analysis.experience?.length
      ? String(analysis.experience[0]).split(' - ')[0].trim()
      : '';

  const targetRole =
    matchedOpportunities[0]?.title || currentRole;

  return {
    cvProfile: cvProfileId,

    identity: {
      currentRole,
      targetRole,
      seniorityLevel,
      industry: analysis.industry || '',
    },

    economy: {
      employabilityScore,
      marketValueScore,
      demandLevel,
      incomePotentialRange: incomePotential,
    },

    skills: {
      core: coreSkills,
      missing: analysis.missingSkills || [],
      emerging: emergingSkills,
      monetizable: monetizableSkills,
    },

    intelligence: {
      strengths: analysis.strengths || [],
      weaknesses: analysis.weaknesses || [],
      opportunities: analysis.opportunities || [],
      threats: analysis.threats || [],
      recommendations: analysis.recommendations || [],
    },

    status: 'ACTIVE',
    lastCalculatedAt: new Date(),

    _matchedOpportunities: matchedOpportunities,
  };
}


// -----------------------------------------------------------------------------
// PUBLIC API
// -----------------------------------------------------------------------------

async function buildTwinData(userId) {
  const cvProfile = await cvRepository.findByUserId(userId);

  if (!cvProfile) {
    throw new NotFoundError('CV profile not found.');
  }

  return _assembleTwinData(cvProfile.analysis, userId, cvProfile._id);
}


// ONLY SAVE POINT (AFTER CHAT)
async function persistTwinFromChat(userId, enrichedTwinData) {
  const { _matchedOpportunities, ...twinPayload } = enrichedTwinData;

  return twinRepository.upsertTwin(userId, twinPayload);
}


// -----------------------------------------------------------------------------
// SIMULATION (READ ONLY + AI)
// -----------------------------------------------------------------------------

async function runSimulation(userId, pathIds) {
  const twin = await twinRepository.findByUserId(userId);

  const prompt = `
You are a career simulation engine.

TWIN:
${JSON.stringify(twin, null, 2)}

PATHS:
${JSON.stringify(pathIds, null, 2)}

Return JSON:
{
  "results": [
    {
      "pathId": "",
      "salaryProjection": number,
      "riskLevel": "",
      "timeToStability": "",
      "growthScore": number,
      "recommendation": ""
    }
  ]
}
`;

  let parsed;

  try {
    const response = await aiServiceClient.post('/simulate', {
      prompt,
      temperature: 0.3,
    });

    const raw =
      response.data?.content ||
      response.data?.reply ||
      JSON.stringify(response.data);

    parsed = JSON.parse(raw.replace(/```json|```/g, '').trim());
  } catch (err) {
    logger.warn('[TwinService] Simulation failed', { userId, error: err.message });
    parsed = { results: [] };
  }

  const updatedTwin = await twinRepository.appendSimulation(userId, {
    results: parsed.results,
    createdAt: new Date(),
  });

  return { simulation: parsed, twin: updatedTwin };
}


// -----------------------------------------------------------------------------
// GET TWIN
// -----------------------------------------------------------------------------

async function getTwin(userId) {
  return twinRepository.findByUserId(userId);
}


// -----------------------------------------------------------------------------
// EXPORTS
// -----------------------------------------------------------------------------

module.exports = {
  buildTwinData,
  persistTwinFromChat,
  runSimulation,
  getTwin,
};