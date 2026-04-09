/**
 * Twin Builder Service
 * =====================
 * Core intelligence layer for Economic Twin system.
 * Converts CV + onboarding data into structured economic intelligence.
 */

const aiClientService = require('../../intergration/ai/ai.ServiceClient');

const cvRepository = require('../cvAnalyser/cvAnalyser.Repository');
const twinRepository = require('./twinBuilder.Repository');

/**
 * =========================
 * INTERNAL: BUILD PROMPT
 * =========================
 */
function buildTwinPrompt(cvProfile, formData = {}) {
  return `
You are an economic intelligence engine.

Your task is to build a structured "Economic Twin" model from user data.

Return ONLY valid JSON with this structure:

{
  "identity": {
    "careerLevel": "",
    "industry": "",
    "location": "",
    "jobSeekingStatus": ""
  },
  "economy": {
    "estimatedIncome": number,
    "incomeConfidence": number,
    "financialStability": "",
    "employmentType": ""
  },
  "skills": {
    "core": [],
    "technical": [],
    "soft": []
  },
  "market": {
    "demandLevel": "",
    "growthPotential": "",
    "competitionLevel": ""
  },
  "intelligence": {
    "careerScore": number,
    "employabilityScore": number,
    "adaptabilityScore": number
  },
  "recommendations": [],
  "risks": [],
  "opportunities": []
}

RULES:
- Be realistic, not optimistic.
- Use South African job market context.
- If data is missing, infer conservatively.
- Do NOT include explanations.
- Return ONLY JSON.

CV DATA:
${JSON.stringify(cvProfile, null, 2)}

FORM DATA:
${JSON.stringify(formData, null, 2)}
`;
}

/**
 * =========================
 * CREATE / UPDATE FROM FORM
 * =========================
 */
async function createOrUpdateFromForm(userId, formData) {
  const cvProfile = await cvRepository.findByUserId(userId);

  const aiResponse = await aiClientService.generateCompletion({
    prompt: buildTwinPrompt(cvProfile, formData),
    temperature: 0.3,
  });

  let parsed;
  try {
    parsed = JSON.parse(aiResponse);
  } catch (err) {
    throw new Error('AI returned invalid JSON for EconomicTwin');
  }

  const twin = await twinRepository.upsertTwin(userId, {
    ...parsed,
    cvProfile: cvProfile?._id,
    source: 'form_ai_generated',
    lastCalculatedAt: new Date(),
  });

  return {
    twin,
    meta: {
      generatedFrom: 'form',
      aiModel: true,
    },
  };
}

/**
 * =========================
 * BUILD FROM CV PROFILE
 * =========================
 */
async function buildFromCvProfile(userId) {
  const cvProfile = await cvRepository.findByUserId(userId);

  if (!cvProfile) {
    throw new Error('CV profile not found');
  }

  const aiResponse = await aiClientService.generateCompletion({
    prompt: buildTwinPrompt(cvProfile),
    temperature: 0.2,
  });

  let parsed;
  try {
    parsed = JSON.parse(aiResponse);
  } catch (err) {
    throw new Error('AI returned invalid JSON for CV-based twin');
  }

  const twin = await twinRepository.upsertTwin(userId, {
    ...parsed,
    cvProfile: cvProfile._id,
    source: 'cv_ai_generated',
    lastCalculatedAt: new Date(),
  });

  return twin;
}

async function buildFromAnalysis(userId, analysis) {
  return twinRepository.upsertTwin(userId, {
    analysis,
    source: 'analysis_direct',
    lastCalculatedAt: new Date(),
  });
}

/**
 * =========================
 * CHAT WITH TWIN
 * =========================
 */
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

  const aiResponse = await aiClientService.generateCompletion({
    prompt,
    temperature: 0.5,
  });

  const message = {
    role: 'assistant',
    content: aiResponse,
    timestamp: new Date(),
  };

  const updatedTwin = await twinRepository.appendChatMessage(userId, message);

  return {
    reply: aiResponse,
    twin: updatedTwin,
  };
}

/**
 * =========================
 * RUN CAREER SIMULATION
 * =========================
 */
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

  const aiResponse = await aiClientService.generateCompletion({
    prompt,
    temperature: 0.3,
  });

  let parsed;
  try {
    parsed = JSON.parse(aiResponse);
  } catch (err) {
    throw new Error('AI returned invalid simulation JSON');
  }

  const updatedTwin = await twinRepository.appendSimulation(userId, {
    results: parsed.results,
    createdAt: new Date(),
  });

  return {
    simulation: parsed,
    twin: updatedTwin,
  };
}

/**
 * =========================
 * GET TWIN
 * =========================
 */
async function getTwin(userId) {
  return twinRepository.findByUserId(userId);
}

module.exports = {
  createOrUpdateFromForm,
  buildFromCvProfile,
  chatWithTwin,
  runSimulation,
  getTwin,
};