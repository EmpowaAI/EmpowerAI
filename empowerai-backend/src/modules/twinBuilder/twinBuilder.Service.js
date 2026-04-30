'use strict';

const cvRepository = require('../cvAnalyser/cvAnalyser.Repository');
const twinRepository = require('./twinBuilder.Repository');
const Opportunity = require('../opportunities/Opportunity.Model');
const logger = require('../../utils/logger');
const aiServiceClient = require('../../intergration/ai/ai.ServiceClient');
const { NotFoundError } = require('../../utils/errors');


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
    const skillScore = oppSkills.length > 0 ? (skillMatches / oppSkills.length) * 35 : 0;

    const industryScore = (
      opp.description?.toLowerCase().includes(userIndustry) ||
      opp.title?.toLowerCase().includes(userIndustry)
    ) ? 20 : 0;

    const oppTitle = (opp.title || '').toLowerCase();
    const seniorityScore = (
      (userLevel.includes('junior') && (oppTitle.includes('junior') || oppTitle.includes('trainee') || oppTitle.includes('intern'))) ||
      (userLevel.includes('mid') && (oppTitle.includes('mid') || oppTitle.includes('intermediate'))) ||
      (userLevel.includes('senior') && oppTitle.includes('senior'))
    ) ? 15 : 5;

    const reqMatches = oppReqs.filter(r => userSkills.some(s => r.includes(s))).length;
    const reqScore = oppReqs.length > 0 ? (reqMatches / oppReqs.length) * 10 : 0;

    const typeScore = ['job', 'freelance'].includes(opp.type) ? 10 :
      ['internship', 'learnership'].includes(opp.type) ? 7 : 5;

    const salaryScore = (opp.salaryRange?.min && opp.salaryRange?.max) ? 5 : 0;

    const deadlineScore = (!opp.deadline || opp.deadline > new Date()) ? 3 : 0;

    const urlScore = opp.applicationUrl ? 2 : 0;

    return {
      opp,
      totalScore: skillScore + industryScore + seniorityScore + reqScore +
        typeScore + salaryScore + deadlineScore + urlScore,
    };
  });

  return scored
    .sort((a, b) => b.totalScore - a.totalScore)
    .slice(0, 10)
    .map(({ opp }) => opp);
}


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
  const isTech = ['technology', 'software', 'it', 'engineering'].some(i =>
    industry.toLowerCase().includes(i)
  );

  const ranges = {
    ENTRY:  isTech ? { min: 8_000,  max: 15_000  } : { min: 5_000,  max: 10_000 },
    JUNIOR: isTech ? { min: 15_000, max: 28_000  } : { min: 10_000, max: 18_000 },
    MID:    isTech ? { min: 28_000, max: 50_000  } : { min: 18_000, max: 35_000 },
    SENIOR: isTech ? { min: 50_000, max: 85_000  } : { min: 35_000, max: 60_000 },
    LEAD:   isTech ? { min: 75_000, max: 120_000 } : { min: 50_000, max: 80_000 },
  };

  return { ...(ranges[seniorityLevel] || ranges.ENTRY), currency: 'ZAR' };
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


const HIGH_VALUE_SKILLS = [
  'react', 'node.js', 'typescript', 'python', 'c#', 'asp.net', '.net',
  'azure', 'aws', 'docker', 'kubernetes', 'fastapi', 'postgresql',
  'mongodb', 'graphql', 'next.js', 'angular', 'vue', 'java', 'spring',
  'machine learning', 'ai', 'data science', 'devops', 'ci/cd',
];

function deriveMonetizableSkills(extractedSkills = []) {
  return extractedSkills.filter(skill =>
    HIGH_VALUE_SKILLS.some(h => skill.toLowerCase().includes(h))
  );
}


function _getDefaultStrengths(industry = '', coreSkills = []) {
  const industryLower = (industry || '').toLowerCase();
  if (industryLower.includes('technology')) {
    return [
      'Strong analytical and problem-solving abilities',
      'Quick learner with technology adaptation skills',
      'Detail-oriented approach to coding and development',
      'Ability to work independently and in team environments',
    ];
  } else if (industryLower.includes('retail')) {
    return [
      'Excellent customer service and communication skills',
      'Proven ability to handle cash transactions accurately',
      'Strong work ethic and reliability in fast-paced environments',
      'Experience with inventory management and stock control',
    ];
  } else if (industryLower.includes('finance')) {
    return [
      'Strong numerical and analytical skills',
      'Attention to detail in financial record keeping',
      'Experience with accounting software and systems',
      'Reliable and trustworthy with confidential information',
    ];
  } else {
    return [
      'Strong communication and interpersonal skills',
      'Reliable and punctual work ethic',
      'Quick learner and adaptable to new challenges',
      'Team player with collaborative working style',
    ];
  }
}

function _getDefaultWeaknesses(industry = '', coreSkills = []) {
  const industryLower = (industry || '').toLowerCase();
  if (industryLower.includes('technology')) {
    return [
      'Limited experience with advanced frameworks and tools',
      'Opportunity to expand knowledge in emerging technologies',
      'Could benefit from more industry-specific certifications',
    ];
  } else if (industryLower.includes('retail')) {
    return [
      'Limited experience with advanced POS systems',
      'Opportunity to develop management and leadership skills',
      'Could benefit from specialized retail certifications',
    ];
  } else if (industryLower.includes('finance')) {
    return [
      'Limited experience with advanced financial analysis',
      'Opportunity to expand knowledge of regulatory compliance',
      'Could benefit from professional accounting qualifications',
    ];
  } else {
    return [
      'Limited specialized industry experience',
      'Opportunity to develop advanced technical skills',
      'Could benefit from industry-specific training and certifications',
    ];
  }
}

function _getDefaultOpportunities(industry = '', seniorityLevel = '') {
  const industryLower = (industry || '').toLowerCase();
  const seniority = (seniorityLevel || '').toLowerCase();
  if (industryLower.includes('technology')) {
    if (seniority.includes('junior') || seniority.includes('entry')) {
      return [
        'Growing demand for junior developers in South African tech companies',
        'Opportunities in software development and IT support roles',
        'Entry-level positions in web development and mobile app development',
      ];
    } else {
      return [
        'Strong demand for experienced developers in fintech and e-commerce',
        'Opportunities in cloud computing and DevOps roles',
        'Growing market for AI/ML and data science specialists',
      ];
    }
  } else if (industryLower.includes('retail')) {
    return [
      'High turnover in retail sector creates ongoing opportunities',
      'Growing e-commerce and online retail market',
      'Management advancement opportunities for experienced staff',
      'Specialized roles in visual merchandising and store management',
    ];
  } else if (industryLower.includes('finance')) {
    return [
      'Growing demand for accounting and financial services professionals',
      'Opportunities in fintech and financial technology companies',
      'Roles in compliance, auditing, and financial analysis',
    ];
  } else {
    return [
      'Growing South African economy creates diverse employment opportunities',
      'Opportunities in both corporate and entrepreneurial ventures',
      'Increasing demand for skilled professionals across industries',
      'Potential for career advancement through continuous learning',
    ];
  }
}

function _getDefaultThreats(industry = '', missingSkills = []) {
  const industryLower = (industry || '').toLowerCase();
  const threats = [];

  if (missingSkills && missingSkills.length > 0) {
    threats.push(`Lack of ${missingSkills[0]} skills limits competitiveness in current market`);
    if (missingSkills.length > 1) {
      threats.push(`Need to develop ${missingSkills[1]} to advance career opportunities`);
    }
  }

  if (industryLower.includes('technology')) {
    threats.push('Rapid technological changes require continuous upskilling');
    threats.push('Increasing competition from global remote workers');
  } else if (industryLower.includes('retail')) {
    threats.push('E-commerce growth may reduce traditional retail positions');
    threats.push('Automation of routine tasks in retail environments');
  } else if (industryLower.includes('finance')) {
    threats.push('Regulatory changes require ongoing compliance training');
    threats.push('Increasing automation of routine financial tasks');
  } else {
    threats.push('Competitive job market requires continuous skill development');
    threats.push('Economic changes may affect industry stability');
  }

  return threats;
}

function _getDefaultRecommendations(industry = '', coreSkills = []) {
  const industryLower = (industry || '').toLowerCase();
  if (industryLower.includes('technology')) {
    return [
      'Build a portfolio showcasing coding projects and applications',
      'Obtain industry-recognized certifications (AWS, Azure, Google Cloud)',
      'Contribute to open-source projects to build experience',
      'Network with local tech communities and attend meetups',
      'Stay updated with latest programming languages and frameworks',
    ];
  } else if (industryLower.includes('retail')) {
    return [
      'Develop strong customer service and communication skills',
      'Learn modern POS systems and retail management software',
      'Consider retail management or visual merchandising courses',
      'Build experience in inventory management and loss prevention',
      'Network with retail professionals and industry associations',
    ];
  } else if (industryLower.includes('finance')) {
    return [
      'Pursue professional accounting qualifications (SAICA, SAIPA)',
      'Develop proficiency in accounting software (Sage, Pastel, SAP)',
      'Build knowledge of tax compliance and financial regulations',
      'Consider certifications in financial analysis or bookkeeping',
      'Network with finance professionals and join industry associations',
    ];
  } else {
    return [
      'Identify and develop industry-specific skills and knowledge',
      'Build a professional network in your chosen field',
      'Consider relevant certifications or training programs',
      'Gain practical experience through internships or part-time roles',
      'Stay informed about industry trends and developments',
    ];
  }
}


async function _assembleTwinData(analysis, userId, cvProfileId) {
  // 1. Match opportunities from DB using CV analysis
  const matchedOpportunities = await matchOpportunities(analysis);
  logger.info('[TwinService] Opportunities matched', {
    userId,
    count: matchedOpportunities.length,
  });

  // 2. Derive all twin fields from analysis + matched opportunities
  const seniorityLevel    = deriveSeniorityLevel(analysis.readinessLevel, analysis.score);
  const demandLevel       = deriveDemandLevel(analysis.score, matchedOpportunities.length);
  const incomePotential   = deriveIncomeRange(seniorityLevel, analysis.industry);
  const emergingSkills    = deriveEmergingSkills(analysis, matchedOpportunities);
  const monetizableSkills = deriveMonetizableSkills(analysis.extractedSkills);

  // 3. Ensure core skills are never empty
  const industry = (analysis.industry || 'general').toLowerCase();
  let coreSkills = [];
  if (industry.includes('technology')) {
    coreSkills = ['problem solving', 'communication', 'basic coding'];
  } else if (industry.includes('retail')) {
    coreSkills = ['customer service', 'cash handling', 'inventory management'];
  } else {
    coreSkills = ['communication', 'problem solving', 'teamwork'];
  }
  const extracted = analysis.extractedSkills || [];
  if (extracted.length > 0) {
    coreSkills = extracted.slice(0, 10);
  }

  // 4. Ensure employability score is never 0
  let employabilityScore = analysis.score || 0;
  if (employabilityScore === 0) {
    const yearsExp = analysis.yearsExperience || 0;
    employabilityScore = Math.min(50 + (yearsExp * 5), 85);
  }

  // 5. Ensure market value is never 0
  let marketValueScore = Math.min(100, employabilityScore + (matchedOpportunities.length * 3));
  if (marketValueScore === 0) {
    marketValueScore = 45 + (coreSkills.length * 5);
  }

  // 6. Derive current role from most recent experience entry
  const experienceList = analysis.experience || [];
  const currentRole = experienceList.length > 0
    ? String(experienceList[0]).split(' - ')[0].trim()
    : '';

  // 7. Derive target role from best matched opportunity title
  const targetRole = matchedOpportunities.length > 0
    ? matchedOpportunities[0].title
    : currentRole;

  // 8. Derive market intelligence from matched opportunities
  const jobTitlesMapped = matchedOpportunities.map(o => o.title);
  const trendingSkills = [...new Set(
    matchedOpportunities.flatMap(o => o.skills || [])
  )].slice(0, 10);

  // 9. Build opportunities array from matched opportunity titles + descriptions
  const opportunitiesIntelligence = matchedOpportunities.slice(0, 5).map(o =>
    `${o.title}${o.company ? ` at ${o.company}` : ''}${o.location ? ` (${o.location})` : ''}`
  );

  // 10. Return assembled twin data — NOT persisted yet
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

    market: {
      trendingSkills,
      decliningSkills: [],       
      jobTitlesMapped,
      competitorRoles: [],       
    },

    intelligence: {
      strengths:       analysis.strengths       || _getDefaultStrengths(analysis.industry, coreSkills),
      weaknesses:      analysis.weaknesses      || _getDefaultWeaknesses(analysis.industry, coreSkills),
      opportunities:   opportunitiesIntelligence.length > 0
        ? opportunitiesIntelligence
        : _getDefaultOpportunities(analysis.industry, seniorityLevel),
      threats:         _getDefaultThreats(analysis.industry, analysis.missingSkills || []),
      recommendations: analysis.recommendations || _getDefaultRecommendations(analysis.industry, coreSkills),
    },

    analysisLatest: {
      source: 'cv_analysis',
      employabilityScore: analysis.score || 0,
      skills: {
        core:      analysis.extractedSkills || [],
        missing:   analysis.missingSkills   || [],
        extracted: analysis.extractedSkills || [],
      },
      swot: {
        strengths:     analysis.strengths     || [],
        weaknesses:    analysis.weaknesses    || [],
        opportunities: opportunitiesIntelligence,
        threats:       [],
      },
      recommendations: analysis.recommendations || [],
      metadata: {
        confidenceScore: analysis.score ? analysis.score / 100 : 0.5,
        modelVersion: 'twin-builder-v1',
      },
    },

    evolution: {
      lastUpdatedBy: 'cv_analysis',
      confidenceScore: analysis.score ? analysis.score / 100 : 0.5,
    },

    status: 'ACTIVE',
    lastCalculatedAt: new Date(),

   
    _matchedOpportunities: matchedOpportunities,
  };
}



async function buildTwinData(userId) {
  logger.info('[TwinService] buildTwinData started (no DB save)', { userId });

  const cvProfile = await cvRepository.findByUserId(userId);
  if (!cvProfile) {
    throw new NotFoundError('CV profile not found. Please upload and analyse your CV first.');
  }

  const twinData = await _assembleTwinData(cvProfile.analysis, userId, cvProfile._id);

  logger.info('[TwinService] Twin data assembled (not persisted)', {
    userId,
    employabilityScore: twinData.economy?.employabilityScore,
    seniorityLevel:     twinData.identity?.seniorityLevel,
    demandLevel:        twinData.economy?.demandLevel,
    opportunitiesUsed:  twinData._matchedOpportunities.length,
  });

  return twinData;
}




async function persistTwinFromChat(userId, enrichedTwinData) {
  logger.info('[TwinService] persistTwinFromChat called', { userId });

  // Strip internal metadata fields before saving
  const { _matchedOpportunities, ...twinPayload } = enrichedTwinData;

  const twin = await twinRepository.upsertTwin(userId, twinPayload);

  logger.info('[TwinService] Economic Twin persisted from chat', {
    userId,
    twinId: twin._id,
    employabilityScore: twin.economy?.employabilityScore,
  });

  return twin;
}


async function buildFromAnalysis(analysis, userId) {
  logger.info('[TwinService] buildFromAnalysis started (legacy — saves to DB)', { userId });

  const cvProfile = await cvRepository.findByUserId(userId);
  if (!cvProfile) {
    throw new NotFoundError('CV profile not found. Please upload and analyse your CV first.');
  }

  const twinData = await _assembleTwinData(analysis, userId, cvProfile._id);
  const { _matchedOpportunities, ...twinPayload } = twinData;

  const twin = await twinRepository.upsertTwin(userId, twinPayload);

  logger.info('[TwinService] Economic Twin built successfully (legacy)', {
    userId,
    twinId: twin._id,
    employabilityScore: twin.economy?.employabilityScore,
    seniorityLevel:     twinData.identity?.seniorityLevel,
    demandLevel:        twinData.economy?.demandLevel,
    opportunitiesUsed:  _matchedOpportunities.length,
  });

  return twin;
}


async function createOrUpdateFromForm(userId, formData) {
  const cvProfile = await cvRepository.findByUserId(userId);
  if (!cvProfile) throw new NotFoundError('CV profile not found. Please upload and analyse your CV first.');

  let aiResult = null;
  try {
    const payload = {
      name:       formData.name       || '',
      age:        formData.age        || 25,
      province:   formData.province   || '',
      skills:     cvProfile.analysis?.extractedSkills || [],
      education:  (cvProfile.analysis?.education  || []).join(', '),
      interests:  formData.interests  || [],
      experience: (cvProfile.analysis?.experience || []).join(', '),
    };

    const response = await aiServiceClient.post('/twin/generate', payload);
    aiResult = response.data;
  } catch (err) {
    logger.warn('[TwinService] Python AI call failed, building from analysis only', {
      userId,
      error: err.message,
    });
  }

  const twin = await buildFromAnalysis(cvProfile.analysis, userId);

  if (aiResult) {
    await twinRepository.upsertTwin(userId, {
      'economy.marketValueScore': aiResult.empowermentScore || twin.economy?.marketValueScore,
      'evolution.lastUpdatedBy':  'twin_builder',
    });
  }

  return { twin, meta: { generatedFrom: 'form', aiModel: !!aiResult } };
}



async function buildFromCvProfile(userId) {
  const cvProfile = await cvRepository.findByUserId(userId);
  if (!cvProfile) throw new NotFoundError('CV profile not found. Please upload and analyse your CV first.');
  return buildFromAnalysis(cvProfile.analysis, userId);
}



async function runSimulation(userId, pathIds) {
  const twin = await twinRepository.findByUserId(userId);

  const prompt = `
You are a career simulation engine.
Simulate career paths based on the user's economic twin.

TWIN:
${JSON.stringify(twin, null, 2)}

PATHS:
${JSON.stringify(pathIds, null, 2)}

Return ONLY JSON:
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

Be realistic and use South African job market assumptions.
`;

  let parsed;
  try {
    const response = await aiServiceClient.post('/simulate', { prompt, temperature: 0.3 });
    const raw = response.data?.content || response.data?.reply || JSON.stringify(response.data);
    parsed = JSON.parse(raw.replace(/```json|```/g, '').trim());
  } catch (err) {
    logger.warn('[TwinService] Simulation AI call failed', { userId, error: err.message });
    parsed = { results: [] };
  }

  const updatedTwin = await twinRepository.appendSimulation(userId, {
    results:   parsed.results,
    createdAt: new Date(),
  });

  return { simulation: parsed, twin: updatedTwin };
}


// -----------------------------------------------------------------------------
// EXPORTED: GET TWIN
// -----------------------------------------------------------------------------

async function getTwin(userId) {
  return twinRepository.findByUserId(userId);
}


module.exports = {
  buildTwinData,          
  persistTwinFromChat,    
  createOrUpdateFromForm,
  buildFromCvProfile,
  runSimulation,
  getTwin,
};
