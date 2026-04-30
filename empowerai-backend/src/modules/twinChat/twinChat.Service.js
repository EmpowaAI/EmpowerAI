'use strict';

const twinBuilderService = require('../twinBuilder/twinBuilder.Service');
const aiServiceClient    = require('../../intergration/ai/ai.ServiceClient');
const logger             = require('../../utils/logger');


function _buildCvContext(twinData) {
  // Support both the raw API shape (identity/economy/skills.core) and the
  // normalized TwinBuilder shape (profile/skills-as-array/gaps) so the chat
  // works regardless of which object the frontend hands us.
  const identity      = twinData.identity      || {};
  const economy       = twinData.economy       || {};
  const intelligence  = twinData.intelligence  || {};
  const analysisLatest = twinData.analysisLatest || {};
  const profile       = twinData.profile       || {};   // normalized shape

  // skills: { core: [...], missing: [...] }  (raw)  OR  [...] (normalized)
  const rawSkills     = twinData.skills;
  const coreSkills    = Array.isArray(rawSkills) ? rawSkills       : (rawSkills?.core    || []);
  const missingSkills = Array.isArray(rawSkills) ? (twinData.gaps || []) : (rawSkills?.missing || []);

  return {
    source: 'twin',

    // Identity — raw shape first, fall back to normalized fields
    currentRole:    identity.currentRole    || profile.name     || twinData.name     || '',
    targetRole:     identity.targetRole     || profile.path     || '',
    industry:       identity.industry       || profile.industry || twinData.industry || '',
    seniorityLevel: identity.seniorityLevel || profile.level    || twinData.level    || 'ENTRY',

    // Economy
    score:            economy.employabilityScore ?? profile.empowermentScore ?? twinData.empowermentScore ?? 50,
    marketValueScore: economy.marketValueScore   ?? 50,
    demandLevel:      economy.demandLevel        || profile.marketDemand || 'LOW',
    yearsExperience:  analysisLatest?.skills?.extracted?.length ?? 0,
    confidenceScore:  Math.round((twinData.evolution?.confidenceScore ?? 0.5) * 100),

    // Intelligence — only available in raw shape
    strengths:       intelligence.strengths       || [],
    weaknesses:      intelligence.weaknesses      || [],
    recommendations: intelligence.recommendations || twinData.recommendations || [],
    missingSkills,

    // Skills — FastAPI reads from sections.skills
    sections: {
      skills: coreSkills.length > 0 ? coreSkills : (profile.skills || []),
    },

    // Market context (extra richness for the system prompt)
    trendingSkills: twinData.market?.trendingSkills || [],
    matchedOpportunities: (twinData._matchedOpportunities || [])
      .slice(0, 5)
      .map(o =>
        `${o.title}${o.company ? ` at ${o.company}` : ''}${o.location ? ` (${o.location})` : ''}`
      ),
  };
}


function _mergeFastApiResponse(twinData, fastApiData) {
  if (!fastApiData?.profile) return twinData;

  const p = fastApiData.profile;

  return {
    ...twinData,

    identity: {
      ...twinData.identity,
      seniorityLevel: _mapCareerStageToSeniority(p.careerStage) || twinData.identity?.seniorityLevel,
      industry:       p.industry || twinData.identity?.industry,
    },

    economy: {
      ...twinData.economy,
      employabilityScore: p.empowermentScore ?? twinData.economy?.employabilityScore,
      marketValueScore:   p.empowermentScore ?? twinData.economy?.marketValueScore,
    },

    skills: {
      ...twinData.skills,
      core: p.skills?.length > 0 ? p.skills : twinData.skills?.core,
    },

    evolution: {
      ...twinData.evolution,
      lastUpdatedBy:   'twin_chat',
      confidenceScore: Math.min(1, (twinData.evolution?.confidenceScore || 0.5) + 0.1),
    },

    // Stash the raw profile for reference after DB save
    _chatProfile: p,
  };
}

function _mapCareerStageToSeniority(careerStage = '') {
  if (careerStage.includes('Established')) return 'SENIOR';
  if (careerStage.includes('Mid'))         return 'MID';
  if (careerStage.includes('Early'))       return 'JUNIOR';
  return null;
}


async function initialiseChatSession(userId) {
  logger.info('[TwinChat] Initialising chat session', { userId });

  const twinData = await twinBuilderService.buildTwinData(userId);

  logger.info('[TwinChat] Session ready', {
    userId,
    employabilityScore:   twinData.economy?.employabilityScore,
    matchedOpportunities: twinData._matchedOpportunities?.length,
  });

  return { twinData };
}


async function sendMessage(userId, message, history, twinData, isLastPrompt = false) {
  logger.info('[TwinChat] sendMessage', { userId, isLastPrompt });

  // Build full messages array in the shape FastAPI ChatRequest expects
  const messages = [
    ...history,
    { role: 'user', content: message },
  ];

  // Map in-memory twin → FastAPI cv_context contract
  const cvContext = _buildCvContext(twinData);

  // Call FastAPI POST /chat/twin via the gate pass
  const response = await aiServiceClient.post('/chat/twin', {
    messages,
    cv_context: cvContext,
    focus: 'growth',
  });

  // FastAPI ChatResponse: { reply, options, allowMultiple, isComplete, profile }
  const fastApiData = response.data;

  // Merge any profile data the AI returned into the in-memory twin
  const updatedTwinData = _mergeFastApiResponse(twinData, fastApiData);

  let savedTwin = null;
  if (isLastPrompt || fastApiData?.isComplete === true) {
    logger.info('[TwinChat] Persisting twin to DB', { userId });
    savedTwin = await twinBuilderService.persistTwinFromChat(userId, updatedTwinData);
  }

  return {
    reply:      fastApiData?.reply      || '',
    options:    fastApiData?.options    || null,
    isComplete: fastApiData?.isComplete || false,
    twinData:   updatedTwinData,
    twin:       savedTwin,
  };
}


module.exports = {
  initialiseChatSession,
  sendMessage,
};
