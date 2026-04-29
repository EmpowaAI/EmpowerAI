'use strict';

const twinRepository = require('../twinBuilder/twinBuilder.Repository');
const cvRepository = require('../cvAnalyser/cvAnalyser.Repository');
const twinService = require('../twinBuilder/twinBuilder.Service');
const userRepository = require('../user/User.Repository');
const aiServiceClient = require('../../intergration/ai/ai.ServiceClient');
const { AppError } = require('../../utils/errors');
const logger = require('../../utils/logger');

// -----------------------------------------------------------------------------
// CONTEXT BUILDER — works from twin OR raw cvProfile
// -----------------------------------------------------------------------------

const buildTwinContext = (twin) => {
  return {
    identity: twin.identity,
    skills: {
      core: twin.skills?.core?.slice(0, 15) || [],
      missing: twin.skills?.missing?.slice(0, 10) || [],
    },
    economy: twin.economy,
    intelligence: {
      strengths: twin.intelligence?.strengths?.slice(0, 5) || [],
      weaknesses: twin.intelligence?.weaknesses?.slice(0, 5) || [],
      recommendations: twin.intelligence?.recommendations?.slice(0, 5) || [],
    },
    market: {
      trendingSkills: twin.market?.trendingSkills?.slice(0, 8) || [],
      jobTitlesMapped: twin.market?.jobTitlesMapped?.slice(0, 8) || [],
    },
  };
};

// Fallback: build a lightweight context from raw CvProfile when twin doesn't exist yet
const buildContextFromCvProfile = (cvProfile) => {
  return {
    identity: {
      name: cvProfile.name,
      currentTitle: cvProfile.currentTitle || 'Not specified',
    },
    skills: {
      core: cvProfile.skills?.slice(0, 15) || [],
      missing: [],
    },
    economy: {
      employabilityScore: cvProfile.score || 0,
      demandLevel: 'UNKNOWN',
    },
    intelligence: {
      strengths: [],
      weaknesses: [],
      recommendations: ['Complete your Economic Twin profile for deeper insights'],
    },
    market: {
      trendingSkills: [],
      jobTitlesMapped: [],
    },
  };
};

// -----------------------------------------------------------------------------
// SYSTEM PROMPT
// -----------------------------------------------------------------------------

const buildSystemPrompt = (context) => {
  return `
You are an advanced Career Intelligence AI.

You analyze a user's Economic Twin and provide:
- Career guidance
- Skill improvement advice
- Job market positioning
- Salary potential insights
- Actionable next steps

RULES:
- Be direct and realistic
- No fluff
- Focus on career outcomes
- Use the twin data only
- If skills are missing, point them out clearly
- Always suggest next actionable step

USER DATA:
${JSON.stringify(context, null, 2)}
`;
};

// -----------------------------------------------------------------------------
// INTERNAL: SYNC PROFILE FIELDS TO USER MODEL
// Called once after the twin is first built (after first chat).
// Pushes CV-extracted fields to the User document via userRepository.
// province, age, phone are NOT available from CV analysis — they come
// from the user's profile form and are handled by updateUser() separately.
// -----------------------------------------------------------------------------

const _syncProfileFromAnalysis = async (userId, analysis) => {
  try {
    const profileUpdate = {};

    // skills — extracted directly from CV
    if (analysis.extractedSkills?.length) {
      profileUpdate.skills = analysis.extractedSkills;
    }

    // interests — use missingSkills as best proxy until user sets them via form
    if (analysis.missingSkills?.length) {
      profileUpdate.interests = analysis.missingSkills;
    }

    // education — flatten array to string if needed
    if (analysis.education?.length) {
      profileUpdate.education = Array.isArray(analysis.education)
        ? analysis.education.join(', ')
        : analysis.education;
    }

    // about / summary — use whichever is present (about takes priority)
    if (analysis.about || analysis.summary) {
      profileUpdate.about = analysis.about || analysis.summary;
    }

    if (Object.keys(profileUpdate).length === 0) return;

    await userRepository.updateUser(userId, profileUpdate);

    logger.info('[TwinChatService] User profile synced from CV analysis', {
      userId,
      fields: Object.keys(profileUpdate),
    });
  } catch (err) {
    // Non-fatal — log and continue. Twin is already saved.
    logger.warn('[TwinChatService] Failed to sync profile fields to User model', {
      userId,
      error: err.message,
    });
  }
};

// -----------------------------------------------------------------------------
// CHAT RESPONSE ENGINE
// -----------------------------------------------------------------------------

const generateTwinChat = async (userId, userMessage) => {
  if (!userMessage) {
    throw new AppError('Message is required', 400);
  }

  // 1. Try to load twin — fall back to CvProfile if twin not built yet
  let context;
  let twinExists = false;

  const twin = await twinRepository.findByUserId(userId);

  if (twin) {
    twinExists = true;
    context = buildTwinContext(twin);
  } else {
    // No twin yet — use CvProfile as fallback context
    const cvProfile = await cvRepository.findByUserId(userId);

    if (!cvProfile) {
      throw new AppError('No CV profile found. Please upload your CV first.', 404);
    }

    context = buildContextFromCvProfile(cvProfile);
  }

  // 2. Build AI prompt
  const systemPrompt = buildSystemPrompt(context);

  // 3. Call AI service
  const aiResponse = await aiServiceClient.chatCompletion({
    system: systemPrompt,
    message: userMessage,
    temperature: 0.4,
  });

  // 4. After chat response — build twin in background if it doesn't exist yet
  if (!twinExists) {
    cvRepository.findByUserId(userId).then(async (cvProfile) => {
      const builtTwin = await twinService.buildFromAnalysis(cvProfile.analysis, userId);
      await _syncProfileFromAnalysis(userId, cvProfile.analysis);
      logger.info('[TwinChatService] Twin built after first chat', { userId, twinId: builtTwin._id });
    }).catch((err) => {
      logger.error('[TwinChatService] Background twin build failed', { userId, error: err.message });
    });
  }

  // 5. Return structured response
  return {
    reply: aiResponse.content,
    contextUsed: {
      skillsCount: context.skills.core.length,
      missingSkills: context.skills.missing.length,
      employabilityScore: context.economy.employabilityScore,
      demandLevel: context.economy.demandLevel,
      twinReady: twinExists, // frontend can use this to show "Twin building..." indicator
    },
  };
};

module.exports = {
  generateTwinChat,
};
