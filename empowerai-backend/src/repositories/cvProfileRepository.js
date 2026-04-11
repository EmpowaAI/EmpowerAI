const CvProfile = require('../models/cvProfile');

const toBool = (value, defaultValue = false) => {
  if (value === undefined || value === null) return defaultValue;
  const normalized = String(value).trim().toLowerCase();
  if (['1', 'true', 'yes', 'y', 'on'].includes(normalized)) return true;
  if (['0', 'false', 'no', 'n', 'off'].includes(normalized)) return false;
  return defaultValue;
};

const toPositiveInt = (value) => {
  const n = Number.parseInt(String(value), 10);
  return Number.isFinite(n) && n > 0 ? n : null;
};

/**
 * Upsert a CvProfile for a user.
 * Uses findOneAndUpdate with upsert:true so re-uploads overwrite the previous profile.
 */
async function saveOrUpdate({ userId, filename, mimetype, fileSize, rawText, analysis, isFallback }) {
  const isComplete = !isFallback && !!analysis?.score;
  const storeRawText = toBool(process.env.CV_STORE_RAW_TEXT, false);

  const ttlDays = process.env.CV_PROFILE_TTL_DAYS ? toPositiveInt(process.env.CV_PROFILE_TTL_DAYS) : null;
  const expiresAt = ttlDays ? new Date(Date.now() + ttlDays * 24 * 60 * 60 * 1000) : null;

  const profile = await CvProfile.findOneAndUpdate(
    { user: userId },
    {
      $set: {
        user: userId,
        filename,
        mimetype,
        fileSize,
        rawText: storeRawText ? (rawText || '').slice(0, 10000) : '',
        analysis: {
          score: analysis?.score ?? 0,
          readinessLevel: analysis?.readinessLevel ?? 'JUNIOR',
          summary: analysis?.summary ?? '',
          about: analysis?.about ?? '',
          industry: analysis?.industry ?? 'general',
          analysisSource: isFallback ? 'fallback' : 'ai',
          extractedSkills: analysis?.extractedSkills ?? [],
          missingSkills: analysis?.missingSkills ?? [],
          marketKeywords: analysis?.marketKeywords ?? [],
          strengths: analysis?.strengths ?? [],
          weaknesses: analysis?.weaknesses ?? [],
          suggestions: analysis?.suggestions ?? [],
          recommendations: analysis?.recommendations ?? [],
          missingKeywords: analysis?.missingKeywords ?? [],
          achievements: analysis?.achievements ?? [],
          education: analysis?.education ?? [],
          experience: analysis?.experience ?? [],
          links: analysis?.links ?? {
            linkedin: false,
            github: false,
            portfolio: false,
            driversLicence: false,
          },
        },
        isComplete,
        isFallback: !!isFallback,
        analyzedAt: new Date(),
        expiresAt,
      },
    },
    {
      new: true,        // return updated document
      upsert: true,     // create if doesn't exist
      runValidators: true,
      setDefaultsOnInsert: true,
    }
  );

  return profile;
}

/**
 * Find a user's CV profile.
 */
async function findByUserId(userId) {
  return CvProfile.findOne({ user: userId }).lean();
}

/**
 * Check if a user has a complete (non-fallback) CV profile.
 */
async function hasCompleteProfile(userId) {
  const profile = await CvProfile.findOne({ user: userId, isComplete: true }).select('_id').lean();
  return !!profile;
}

/**
 * Delete a user's CV profile (e.g. account deletion).
 */
async function deleteByUserId(userId) {
  return CvProfile.deleteOne({ user: userId });
}

module.exports = {
  saveOrUpdate,
  findByUserId,
  hasCompleteProfile,
  deleteByUserId,
};
