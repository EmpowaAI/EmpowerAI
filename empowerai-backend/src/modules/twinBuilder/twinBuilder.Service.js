/**
 * Twin Builder Service
 * =====================
 * Core intelligence layer for Economic Twin system.
 * Converts CV analysis + matched opportunities into a fully populated EconomicTwin.
 *
 * NOTE on AI calls:
 * The Python AI service exposes:
 *   POST /twin/generate  → accepts UserData { name, age, province, skills, education }
 *                          returns { skillVector, incomeProjection, empowermentScore, growthModel }
 *   POST /cv/analyze-file → multipart file upload, returns full CVAnalysisResponse
 *
 * buildFromAnalysis() does NOT call the Python service — the CV analysis already
 * contains all the intelligence needed (skills, SWOT, scores, industry, etc).
 * We enrich it with opportunity matching from our own DB and map everything
 * directly onto the EconomicTwin model.
 *
 * createOrUpdateFromForm() calls POST /twin/generate with UserData to get
 * income projections and skill vectors from the Python AI service.
 */

const cvRepository   = require('../cvAnalyser/cvAnalyser.Repository');
const twinRepository = require('./twinBuilder.Repository');
const Opportunity    = require('../opportunities/Opportunity.Model');
const logger         = require('../../utils/logger');
const aiServiceClient = require('../../intergration/ai/ai.ServiceClient');


// ─────────────────────────────────────────────────────────────────────────────
// INTERNAL: OPPORTUNITY MATCHING
// Scores each active opportunity against the user's extracted skills.
// Returns top 10 ranked matches.
// ─────────────────────────────────────────────────────────────────────────────

async function matchOpportunities(analysis) {
  const userSkills   = (analysis.extractedSkills || []).map(s => s.toLowerCase());
  const userIndustry = (analysis.industry        || '').toLowerCase();
  const userLevel    = (analysis.readinessLevel  || '').toLowerCase();

  const opportunities = await Opportunity.find({ isActive: true }).lean();

  const scored = opportunities.map((opp) => {
    const oppSkills = (opp.skills        || []).map(s => s.toLowerCase());
    const oppReqs   = (opp.requirements  || []).map(r => r.toLowerCase());

    // Criteria 1: Skill overlap (weight 35)
    const skillMatches = oppSkills.filter(s => userSkills.includes(s)).length;
    const skillScore   = oppSkills.length > 0 ? (skillMatches / oppSkills.length) * 35 : 0;

    // Criteria 2: Industry alignment (weight 20)
    const industryScore = opp.description?.toLowerCase().includes(userIndustry) ? 20 : 0;

    // Criteria 3: Seniority fit (weight 15)
    const oppTitle      = (opp.title || '').toLowerCase();
    const seniorityScore = (
      (userLevel.includes('junior') && (oppTitle.includes('junior') || oppTitle.includes('trainee') || oppTitle.includes('intern'))) ||
      (userLevel.includes('mid')    && (oppTitle.includes('mid')    || oppTitle.includes('intermediate'))) ||
      (userLevel.includes('senior') && oppTitle.includes('senior'))
    ) ? 15 : 5;

    // Criteria 4: Requirements match (weight 10)
    const reqMatches = oppReqs.filter(r => userSkills.some(s => r.includes(s))).length;
    const reqScore   = oppReqs.length > 0 ? (reqMatches / oppReqs.length) * 10 : 0;

    // Criteria 5: Opportunity type (weight 10)
    const typeScore = ['job', 'freelance'].includes(opp.type)              ? 10 :
                      ['internship', 'learnership'].includes(opp.type)     ? 7  : 5;

    // Criteria 6: Has salary range (weight 5)
    const salaryScore   = (opp.salaryRange?.min && opp.salaryRange?.max) ? 5 : 0;

    // Criteria 7: Not expired (weight 3)
    const deadlineScore = (!opp.deadline || opp.deadline > new Date()) ? 3 : 0;

    // Criteria 8: Has application URL (weight 2)
    const urlScore      = opp.applicationUrl ? 2 : 0;

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


// ─────────────────────────────────────────────────────────────────────────────
// INTERNAL: DERIVE SENIORITY LEVEL
// Maps readinessLevel string from CV analysis to EconomicTwin enum values.
// ─────────────────────────────────────────────────────────────────────────────

function deriveSeniorityLevel(readinessLevel = '', score = 0) {
  const level = readinessLevel.toLowerCase();
  if (level.includes('senior') || level.includes('lead'))   return 'SENIOR';
  if (level.includes('mid')    || level.includes('intermediate')) return 'MID';
  if (level.includes('junior') || level.includes('high potential')) return 'JUNIOR';
  if (score >= 75) return 'JUNIOR';
  if (score >= 50) return 'ENTRY';
  return 'ENTRY';
}


// ─────────────────────────────────────────────────────────────────────────────
// INTERNAL: DERIVE DEMAND LEVEL
// Based on score and how many opportunities matched.
// ─────────────────────────────────────────────────────────────────────────────

function deriveDemandLevel(score = 0, matchedCount = 0) {
  if (score >= 80 && matchedCount >= 7) return 'CRITICAL';
  if (score >= 65 && matchedCount >= 4) return 'HIGH';
  if (score >= 45 && matchedCount >= 2) return 'MEDIUM';
  return 'LOW';
}


// ─────────────────────────────────────────────────────────────────────────────
// INTERNAL: DERIVE INCOME RANGE (ZAR monthly)
// Conservative SA market estimates based on seniority and industry.
// ─────────────────────────────────────────────────────────────────────────────

function deriveIncomeRange(seniorityLevel, industry = '') {
  const isTech = ['technology', 'software', 'it', 'engineering'].some(i =>
    industry.toLowerCase().includes(i)
  );

  const ranges = {
    ENTRY:  isTech ? { min: 8_000,  max: 15_000 } : { min: 5_000,  max: 10_000 },
    JUNIOR: isTech ? { min: 15_000, max: 28_000 } : { min: 10_000, max: 18_000 },
    MID:    isTech ? { min: 28_000, max: 50_000 } : { min: 18_000, max: 35_000 },
    SENIOR: isTech ? { min: 50_000, max: 85_000 } : { min: 35_000, max: 60_000 },
    LEAD:   isTech ? { min: 75_000, max: 120_000 }: { min: 50_000, max: 80_000 },
  };

  return { ...(ranges[seniorityLevel] || ranges.ENTRY), currency: 'ZAR' };
}


// ─────────────────────────────────────────────────────────────────────────────
// INTERNAL: DERIVE EMERGING SKILLS
// Skills appearing in matched opportunities that the user does NOT have.
// ─────────────────────────────────────────────────────────────────────────────

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


// ─────────────────────────────────────────────────────────────────────────────
// INTERNAL: DERIVE MONETIZABLE SKILLS
// High-value SA tech market skills the user already has.
// ─────────────────────────────────────────────────────────────────────────────

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


// ─────────────────────────────────────────────────────────────────────────────
// INTERNAL: DEFAULT INTELLIGENCE HELPERS
// Provide meaningful defaults when CV analysis lacks intelligence data.
// ─────────────────────────────────────────────────────────────────────────────

function _getDefaultStrengths(industry = '', coreSkills = []) {
  const industryLower = (industry || '').toLowerCase();
  
  if (industryLower.includes('technology')) {
    return [
      'Strong analytical and problem-solving abilities',
      'Quick learner with technology adaptation skills',
      'Detail-oriented approach to coding and development',
      'Ability to work independently and in team environments'
    ];
  } else if (industryLower.includes('retail')) {
    return [
      'Excellent customer service and communication skills',
      'Proven ability to handle cash transactions accurately',
      'Strong work ethic and reliability in fast-paced environments',
      'Experience with inventory management and stock control'
    ];
  } else if (industryLower.includes('finance')) {
    return [
      'Strong numerical and analytical skills',
      'Attention to detail in financial record keeping',
      'Experience with accounting software and systems',
      'Reliable and trustworthy with confidential information'
    ];
  } else {
    return [
      'Strong communication and interpersonal skills',
      'Reliable and punctual work ethic',
      'Quick learner and adaptable to new challenges',
      'Team player with collaborative working style'
    ];
  }
}

function _getDefaultWeaknesses(industry = '', coreSkills = []) {
  const industryLower = (industry || '').toLowerCase();
  
  if (industryLower.includes('technology')) {
    return [
      'Limited experience with advanced frameworks and tools',
      'Opportunity to expand knowledge in emerging technologies',
      'Could benefit from more industry-specific certifications'
    ];
  } else if (industryLower.includes('retail')) {
    return [
      'Limited experience with advanced POS systems',
      'Opportunity to develop management and leadership skills',
      'Could benefit from specialized retail certifications'
    ];
  } else if (industryLower.includes('finance')) {
    return [
      'Limited experience with advanced financial analysis',
      'Opportunity to expand knowledge of regulatory compliance',
      'Could benefit from professional accounting qualifications'
    ];
  } else {
    return [
      'Limited specialized industry experience',
      'Opportunity to develop advanced technical skills',
      'Could benefit from industry-specific training and certifications'
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
        'Entry-level positions in web development and mobile app development'
      ];
    } else {
      return [
        'Strong demand for experienced developers in fintech and e-commerce',
        'Opportunities in cloud computing and DevOps roles',
        'Growing market for AI/ML and data science specialists'
      ];
    }
  } else if (industryLower.includes('retail')) {
    return [
      'High turnover in retail sector creates ongoing opportunities',
      'Growing e-commerce and online retail market',
      'Management advancement opportunities for experienced staff',
      'Specialized roles in visual merchandising and store management'
    ];
  } else if (industryLower.includes('finance')) {
    return [
      'Growing demand for accounting and financial services professionals',
      'Opportunities in fintech and financial technology companies',
      'Roles in compliance, auditing, and financial analysis'
    ];
  } else {
    return [
      'Growing South African economy creates diverse employment opportunities',
      'Opportunities in both corporate and entrepreneurial ventures',
      'Increasing demand for skilled professionals across industries',
      'Potential for career advancement through continuous learning'
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
      'Stay updated with latest programming languages and frameworks'
    ];
  } else if (industryLower.includes('retail')) {
    return [
      'Develop strong customer service and communication skills',
      'Learn modern POS systems and retail management software',
      'Consider retail management or visual merchandising courses',
      'Build experience in inventory management and loss prevention',
      'Network with retail professionals and industry associations'
    ];
  } else if (industryLower.includes('finance')) {
    return [
      'Pursue professional accounting qualifications (SAICA, SAIPA)',
      'Develop proficiency in accounting software (Sage, Pastel, SAP)',
      'Build knowledge of tax compliance and financial regulations',
      'Consider certifications in financial analysis or bookkeeping',
      'Network with finance professionals and join industry associations'
    ];
  } else {
    return [
      'Identify and develop industry-specific skills and knowledge',
      'Build a professional network in your chosen field',
      'Consider relevant certifications or training programs',
      'Gain practical experience through internships or part-time roles',
      'Stay informed about industry trends and developments'
    ];
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// EXPORTED: BUILD FROM ANALYSIS
// Background trigger — called automatically after CV upload completes.
// Signature matches the call in cvService:
//   twinService.buildFromAnalysis(profile.analysis, userId)
// ─────────────────────────────────────────────────────────────────────────────

async function buildFromAnalysis(analysis, userId) {
  logger.info('[TwinService] buildFromAnalysis started', { userId });

  // 1. Fetch CvProfile for the _id reference
  const cvProfile = await cvRepository.findByUserId(userId);
  if (!cvProfile) {
    throw new Error(`[TwinService] CvProfile not found for userId: ${userId}`);
  }

  // 2. Match opportunities from DB
  const matchedOpportunities = await matchOpportunities(analysis);
  logger.info('[TwinService] Opportunities matched', {
    userId,
    count: matchedOpportunities.length,
  });

  // 3. Derive all twin fields from analysis + matched opportunities
  const seniorityLevel    = deriveSeniorityLevel(analysis.readinessLevel, analysis.score);
  const demandLevel       = deriveDemandLevel(analysis.score, matchedOpportunities.length);
  const incomePotential   = deriveIncomeRange(seniorityLevel, analysis.industry);
  const emergingSkills    = deriveEmergingSkills(analysis, matchedOpportunities);
  const monetizableSkills = deriveMonetizableSkills(analysis.extractedSkills);

  // CRITICAL: Ensure core skills are never empty
  let coreSkills = analysis.extractedSkills || [];
  if (!coreSkills || coreSkills.length === 0) {
    const industry = (analysis.industry || 'general').toLowerCase();
    if (industry.includes('technology')) {
      coreSkills = ["problem solving", "communication", "basic coding"];
    } else if (industry.includes('retail')) {
      coreSkills = ["customer service", "cash handling", "inventory management"];
    } else {
      coreSkills = ["communication", "problem solving", "teamwork"];
    }
    logger.warn('[TwinService] CV analysis had no skills, using defaults', { userId, industry, defaultSkills: coreSkills });
  }
  
  // CRITICAL: Ensure employability score is never 0
  let employabilityScore = analysis.score || 0;
  if (employabilityScore === 0) {
    const yearsExp = analysis.yearsExperience || 0;
    employabilityScore = 50 + (yearsExp * 5);
    employabilityScore = Math.min(employabilityScore, 85);
  }
  
  // CRITICAL: Ensure market value is never 0
  let marketValueScore = Math.min(100, employabilityScore + (matchedOpportunities.length * 3));
  if (marketValueScore === 0) {
    marketValueScore = 45 + (coreSkills.length * 5);
  }

  // 4. Derive current role from most recent experience entry
  const experienceList  = analysis.experience || [];
  const currentRole     = experienceList.length > 0
    ? String(experienceList[0]).split(' - ')[0].trim()
    : '';

  // 5. Derive target role from best matched opportunity title
  const targetRole = matchedOpportunities.length > 0
    ? matchedOpportunities[0].title
    : currentRole;

  // 6. Derive market intelligence from matched opportunities
  const jobTitlesMapped = matchedOpportunities.map(o => o.title);
  const trendingSkills  = [...new Set(
    matchedOpportunities.flatMap(o => o.skills || [])
  )].slice(0, 10);

  // 7. Build opportunities array from matched opportunity titles + descriptions
  const opportunitiesIntelligence = matchedOpportunities.slice(0, 5).map(o =>
    `${o.title}${o.company ? ` at ${o.company}` : ''}${o.location ? ` (${o.location})` : ''}`
  );

  // 8. Upsert EconomicTwin
  const twin = await twinRepository.upsertTwin(userId, {
    cvProfile: cvProfile._id,

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
      core:        coreSkills,
      missing:     analysis.missingSkills   || [],
      emerging:    emergingSkills,
      monetizable: monetizableSkills,
    },

    market: {
      trendingSkills,
      decliningSkills: [],          // requires market engine — populated later
      jobTitlesMapped,
      competitorRoles: [],          // requires market engine — populated later
    },

    intelligence: {
      strengths:       analysis.strengths       || _getDefaultStrengths(analysis.industry, coreSkills),
      weaknesses:      analysis.weaknesses      || _getDefaultWeaknesses(analysis.industry, coreSkills),
      opportunities:   opportunitiesIntelligence.length > 0 ? opportunitiesIntelligence : _getDefaultOpportunities(analysis.industry, seniorityLevel),
      threats:         _getDefaultThreats(analysis.industry, analysis.missingSkills || []),
      recommendations: analysis.recommendations || _getDefaultRecommendations(analysis.industry, coreSkills),
    },

    analysisLatest: {
      source:             'cv_analysis',
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
        modelVersion:    'twin-builder-v1',
      },
    },

    evolution: {
      lastUpdatedBy:   'cv_analysis',
      confidenceScore: analysis.score ? analysis.score / 100 : 0.5,
    },

    status:           'ACTIVE',
    lastCalculatedAt: new Date(),
  });

  logger.info('[TwinService] Economic Twin built successfully', {
    userId,
    twinId:             twin._id,
    employabilityScore: twin.economy?.employabilityScore,
    seniorityLevel,
    demandLevel,
    opportunitiesUsed:  matchedOpportunities.length,
  });

  return twin;
}


// ─────────────────────────────────────────────────────────────────────────────
// EXPORTED: CREATE / UPDATE FROM FORM
// Calls Python AI service POST /twin/generate with UserData payload.
// Merges AI response (income projections, skill vectors) into the twin.
// ─────────────────────────────────────────────────────────────────────────────

async function createOrUpdateFromForm(userId, formData) {
  const cvProfile = await cvRepository.findByUserId(userId);
  if (!cvProfile) throw new Error('CV profile not found');

  // Call Python AI service with UserData shape
  let aiResult = null;
  try {
    const payload = {
      name:       formData.name       || '',
      age:        formData.age        || 25,
      province:   formData.province   || '',
      skills:     cvProfile.analysis?.extractedSkills || [],
      education:  (cvProfile.analysis?.education || []).join(', '),
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

  // Build base twin from analysis
  const twin = await buildFromAnalysis(cvProfile.analysis, userId);

  // If AI service returned income projections, merge them in
  if (aiResult) {
    await twinRepository.upsertTwin(userId, {
      'economy.marketValueScore': aiResult.empowermentScore || twin.economy?.marketValueScore,
      'evolution.lastUpdatedBy':  'twin_builder',
    });
  }

  return { twin, meta: { generatedFrom: 'form', aiModel: !!aiResult } };
}


// ─────────────────────────────────────────────────────────────────────────────
// EXPORTED: BUILD FROM CV PROFILE (manual trigger)
// ─────────────────────────────────────────────────────────────────────────────

async function buildFromCvProfile(userId) {
  const cvProfile = await cvRepository.findByUserId(userId);
  if (!cvProfile) throw new Error('CV profile not found');
  return buildFromAnalysis(cvProfile.analysis, userId);
}


// ─────────────────────────────────────────────────────────────────────────────
// EXPORTED: CHAT WITH TWIN
// ─────────────────────────────────────────────────────────────────────────────

async function chatWithTwin(userId, messages) {
  const twin = await twinRepository.findByUserId(userId);

  const prompt = `
You are the user's Economic Twin.
You simulate a career advisor, economist, and personal growth analyst.
Use the twin data below as your memory:

TWIN STATE:
${JSON.stringify(twin, null, 2)}

Conversation:
${JSON.stringify(messages, null, 2)}

Rules:
- Be direct and realistic
- Give career-focused advice
- Consider South African job market
- Do not hallucinate data outside twin state
`;

  // Chat uses the Python AI service via a generic completion endpoint if available,
  // otherwise falls back to a structured response from twin data.
  let aiResponse;
  try {
    const response = await aiServiceClient.post('/chat', { prompt, temperature: 0.5 });
    aiResponse = response.data?.reply || response.data?.content || String(response.data);
  } catch (err) {
    logger.warn('[TwinService] Chat AI call failed', { userId, error: err.message });
    aiResponse = "I'm currently unable to process your request. Please try again shortly.";
  }

  const message = { role: 'assistant', content: aiResponse, timestamp: new Date() };
  const updatedTwin = await twinRepository.appendChatMessage(userId, message);

  return { reply: aiResponse, twin: updatedTwin };
}


// ─────────────────────────────────────────────────────────────────────────────
// EXPORTED: RUN CAREER SIMULATION
// ─────────────────────────────────────────────────────────────────────────────

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


// ─────────────────────────────────────────────────────────────────────────────
// EXPORTED: GET TWIN
// ─────────────────────────────────────────────────────────────────────────────

async function getTwin(userId) {
  return twinRepository.findByUserId(userId);
}


module.exports = {
  buildFromAnalysis,
  createOrUpdateFromForm,
  buildFromCvProfile,
  chatWithTwin,
  runSimulation,
  getTwin,
};
