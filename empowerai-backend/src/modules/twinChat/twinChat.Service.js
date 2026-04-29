'use strict';

const twinBuilderService = require('../twinBuilder/twinBuilder.Service');
const aiServiceClient    = require('../../intergration/ai/ai.ServiceClient');
const logger             = require('../../utils/logger');


function _buildCvContext(twinData) {
  return {

    source: 'twin',

    // Identity
    currentRole:    twinData.identity?.currentRole    || '',
    targetRole:     twinData.identity?.targetRole     || '',
    industry:       twinData.identity?.industry       || '',
    seniorityLevel: twinData.identity?.seniorityLevel || 'ENTRY',

    // Economy
    score:            twinData.economy?.employabilityScore ?? 50,
    marketValueScore: twinData.economy?.marketValueScore   ?? 50,
    demandLevel:      twinData.economy?.demandLevel        || 'LOW',
    yearsExperience:  twinData.analysisLatest?.skills?.extracted?.length ?? 0,
    confidenceScore:  Math.round((twinData.evolution?.confidenceScore ?? 0.5) * 100),

    // Intelligence
    strengths:       twinData.intelligence?.strengths       || [],
    weaknesses:      twinData.intelligence?.weaknesses      || [],
    recommendations: twinData.intelligence?.recommendations || [],
    missingSkills:   twinData.skills?.missing               || [],

    // Skills — FastAPI reads from sections.skills
    sections: {
      skills: twinData.skills?.core || [],
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
