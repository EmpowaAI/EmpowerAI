const cvProfileRepository = require('../repositories/cvProfileRepository');
const logger = require('../utils/logger');

/**
 * Save or update a CvProfile after a successful AI analysis.
 * Called by the CV controller after receiving the AI service response.
 */
async function saveAnalysisResult({ userId, file, rawText, analysis, isFallback = false }) {
  try {
    const profile = await cvProfileRepository.saveOrUpdate({
      userId,
      filename: file?.originalname ?? null,
      mimetype: file?.mimetype ?? null,
      fileSize: file?.size ?? null,
      rawText,
      analysis,
      isFallback,
    });

    logger.info('[CvService] CvProfile saved', {
      userId,
      profileId: profile._id,
      score: profile.analysis?.score,
      isFallback,
      isComplete: profile.isComplete,
    });

    return profile;
  } catch (error) {
    // Log but don't throw — a save failure should not break the CV response to the user.
    // The analysis result is still valid; the user can retry later.
    logger.error('[CvService] Failed to save CvProfile', {
      userId,
      error: error.message,
      stack: error.stack,
    });
    return null;
  }
}

/**
 * Get a user's CV profile.
 */
async function getCvProfile(userId) {
  return cvProfileRepository.findByUserId(userId);
}

/**
 * Check if a user has a complete CV profile (used by onboarding gate).
 */
async function hasCompleteProfile(userId) {
  return cvProfileRepository.hasCompleteProfile(userId);
}

/**
 * Delete a user's CV profile (account deletion flow).
 */
async function deleteCvProfile(userId) {
  return cvProfileRepository.deleteByUserId(userId);
}

module.exports = {
  saveAnalysisResult,
  getCvProfile,
  hasCompleteProfile,
  deleteCvProfile,
};
