const CvProfile = require('../cvAnalyser/cvAnalyser.Model');
const { encryptAnalysis, decryptAnalysis, encryptField, decryptField } = require('../../utils/encryption.util');

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


async function saveOrUpdate({ userId, filename, mimetype, fileSize, rawText, analysis, isFallback }) {
  const isComplete = !isFallback && !!analysis?.score;
  const storeRawText = toBool(process.env.CV_STORE_RAW_TEXT, false);

  const ttlDays = process.env.CV_PROFILE_TTL_DAYS ? toPositiveInt(process.env.CV_PROFILE_TTL_DAYS) : null;
  const expiresAt = ttlDays ? new Date(Date.now() + ttlDays * 24 * 60 * 60 * 1000) : null;

  
  const encryptedAnalysis = encryptAnalysis(analysis);

  const rawTextToStore = storeRawText ? encryptField((rawText || '').slice(0, 10000)) : '';

  const profile = await CvProfile.findOneAndUpdate(
    { user: userId },
    {
      $set: {
        user: userId,
        filename,
        mimetype,
        fileSize,
        rawText: rawTextToStore,
        analysis: {
          score:          encryptedAnalysis.score          ?? 0,
          readinessLevel: encryptedAnalysis.readinessLevel ?? 'JUNIOR',
          summary:        encryptedAnalysis.summary        ?? '',
          about:          encryptedAnalysis.about          ?? '',
          industry:       encryptedAnalysis.industry       ?? 'general',
          analysisSource: isFallback ? 'fallback' : 'ai',

          extractedSkills:   encryptedAnalysis.extractedSkills   ?? [],
          missingSkills:     encryptedAnalysis.missingSkills      ?? [],
          marketKeywords:    encryptedAnalysis.marketKeywords     ?? [],
          strengths:         encryptedAnalysis.strengths         ?? [],
          weaknesses:        encryptedAnalysis.weaknesses        ?? [],
          suggestions:       encryptedAnalysis.suggestions       ?? [],
          recommendations:   encryptedAnalysis.recommendations   ?? [],
          missingKeywords:   encryptedAnalysis.missingKeywords   ?? [],
          achievements:      encryptedAnalysis.achievements      ?? [],

          education:  encryptedAnalysis.education  ?? [],
          experience: encryptedAnalysis.experience ?? [],

          links: encryptedAnalysis.links ?? {
            linkedin:       false,
            github:         false,
            portfolio:      false,
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
      new: true,           
      upsert: true,        
      runValidators: true,
      setDefaultsOnInsert: true,
    }
  );


  return _withDecryptedAnalysis(profile);
}


async function findByUserId(userId) {
  const profile = await CvProfile.findOne({ user: userId }).lean();
  if (!profile) return null;
  return _withDecryptedAnalysis(profile);
}

async function hasCompleteProfile(userId) {
  const profile = await CvProfile.findOne({ user: userId, isComplete: true }).select('_id').lean();
  return !!profile;
}

async function deleteByUserId(userId) {
  return CvProfile.deleteOne({ user: userId });
}

function _withDecryptedAnalysis(profile) {
  if (!profile) return null;

  const plain = typeof profile.toObject === 'function' ? profile.toObject() : { ...profile };

  if (plain.analysis) {
    plain.analysis = decryptAnalysis(plain.analysis);
  }

  if (plain.rawText && typeof plain.rawText === 'string' && plain.rawText.includes(':')) {
    plain.rawText = decryptField(plain.rawText) ?? '';
  }

  return plain;
}

module.exports = {
  saveOrUpdate,
  findByUserId,
  hasCompleteProfile,
  deleteByUserId,
};
