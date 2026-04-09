/**
 * TwinChat Service
 * Converts Economic Twin data into intelligent conversational AI context
 */

const twinRepository = require('../twinBuilder/twinBuilder.Repository');
const aiServiceClient = require('../../intergration/ai/ai.ServiceClient');
const { AppError } = require('../../utils/errors');

// -----------------------------------------------------------------------------
// CONTEXT BUILDER (CRITICAL)
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

// -----------------------------------------------------------------------------
// SYSTEM PROMPT (THIS IS YOUR BRAIN)
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
// CHAT RESPONSE ENGINE
// -----------------------------------------------------------------------------

const generateTwinChat = async (userId, userMessage) => {
  if (!userMessage) {
    throw new AppError('Message is required', 400);
  }

  // 1. Load twin
  const twin = await twinRepository.findByUserId(userId);

  if (!twin) {
    throw new AppError('Economic Twin not found for user', 404);
  }

  // 2. Build compact context
  const context = buildTwinContext(twin);

  // 3. Build AI prompt
  const systemPrompt = buildSystemPrompt(context);

  // 4. Call AI service
  const aiResponse = await aiServiceClient.chatCompletion({
    system: systemPrompt,
    message: userMessage,
    temperature: 0.4,
  });

  // 5. Return structured response
  return {
    reply: aiResponse.content,
    contextUsed: {
      skillsCount: context.skills.core.length,
      missingSkills: context.skills.missing.length,
      employabilityScore: context.economy.employabilityScore,
      demandLevel: context.economy.demandLevel,
    },
  };
};

// -----------------------------------------------------------------------------
// EXPORTS
// -----------------------------------------------------------------------------

module.exports = {
  generateTwinChat,
};