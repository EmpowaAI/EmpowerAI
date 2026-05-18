'use strict';

const twinBuilderService = require('../twinBuilder/twinBuilder.Service');
const twinRepository     = require('../twinBuilder/twinBuilder.Repository');
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

  // Prefer the persisted (AI-enriched) twin from MongoDB so the chat always
  // starts with the richest available data. Only rebuild rule-based if no
  // saved twin exists yet.
  let twinData = await twinRepository.findByUserId(userId);

  if (!twinData) {
    logger.info('[TwinChat] No persisted twin found — building from CV profile', { userId });
    twinData = await twinBuilderService.buildTwinData(userId);
  }

  logger.info('[TwinChat] Session ready', {
    userId,
    employabilityScore:   twinData.economy?.employabilityScore,
    industry:             twinData.identity?.industry,
    coreSkillCount:       twinData.skills?.core?.length ?? 0,
  });

  return { twinData };
}


async function sendMessage(userId, message, history, twinData, isLastPrompt = false) {
  logger.info('[TwinChat] sendMessage', { userId, isLastPrompt });

  // Build full messages array in the shape FastAPI ChatRequest expects.
  // The frontend already appends the current user message to history before
  // calling this function, so we only add `message` here if it differs from
  // the last history entry (avoids a duplicate when both are the same).
  const lastHistoryMsg = history[history.length - 1];
  const alreadyAppended =
    lastHistoryMsg?.role === 'user' && lastHistoryMsg?.content === message;
  const messages = alreadyAppended
    ? history
    : [...history, { role: 'user', content: message }];

  // Map in-memory twin → FastAPI cv_context contract
  const cvContext = _buildCvContext(twinData);

  // Call FastAPI POST /chat/twin — degrade gracefully if the AI service is
  // unavailable so the Node backend never returns a 500 to the browser.
  let fastApiData = null;
  try {
    const response = await aiServiceClient.post('/chat/twin', {
      messages,
      cv_context: cvContext,
      focus: 'growth',
    });
    fastApiData = response.data;
  } catch (aiErr) {
    logger.warn('[TwinChat] AI service call failed — returning fallback reply', {
      userId,
      error: aiErr.message,
    });
    fastApiData = {
      reply: "I'm having a brief connection issue with the AI service. Please try again in a moment.",
      options: null,
      isComplete: false,
      profile: null,
    };
  }

  // Merge any profile data the AI returned into the in-memory twin
  const updatedTwinData = _mergeFastApiResponse(twinData, fastApiData);

  let savedTwin = null;
  if (isLastPrompt || fastApiData?.isComplete === true) {
    logger.info('[TwinChat] Persisting twin to DB', { userId });
    try {
      savedTwin = await twinBuilderService.persistTwinFromChat(userId, updatedTwinData);
    } catch (dbErr) {
      logger.warn('[TwinChat] Failed to persist twin to DB', { userId, error: dbErr.message });
    }
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
