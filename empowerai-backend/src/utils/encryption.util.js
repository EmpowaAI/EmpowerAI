'use strict';

const crypto = require('crypto');

const ALGORITHM  = 'aes-256-gcm';
const IV_LENGTH  = 12;
const TAG_LENGTH = 16;

// ── Profile fields to encrypt individually ───────────────────────────────────
const PROFILE_SCALAR_FIELDS = ['phone', 'province', 'education'];
const PROFILE_ARRAY_FIELDS  = ['skills', 'interests'];

// ── Key management ───────────────────────────────────────────────────────────

let _cachedKey = null;

function _getKey() {
  if (_cachedKey) return _cachedKey;

  const hex = process.env.ENCRYPTION_KEY;
  if (!hex || hex.length !== 64) {
    throw new Error(
      '[Encryption] ENCRYPTION_KEY must be a 64-character hex string (32 bytes). ' +
      'Generate one with: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"'
    );
  }

  _cachedKey = Buffer.from(hex, 'hex');
  return _cachedKey;
}

// ── Core field encryption / decryption ───────────────────────────────────────

/**
 * Encrypts any serialisable value (string, number, array, object).
 * Returns a colon-delimited string: "<iv>:<authTag>:<ciphertext>"
 * Returns the original value unchanged if null / undefined.
 */
function encryptField(value) {
  if (value === null || value === undefined) return value;

  const key       = _getKey();
  const iv        = crypto.randomBytes(IV_LENGTH);
  const cipher    = crypto.createCipheriv(ALGORITHM, key, iv, { authTagLength: TAG_LENGTH });
  const plaintext = JSON.stringify(value);

  let ciphertext  = cipher.update(plaintext, 'utf8', 'hex');
  ciphertext     += cipher.final('hex');

  const authTag = cipher.getAuthTag().toString('hex');

  return `${iv.toString('hex')}:${authTag}:${ciphertext}`;
}

/**
 * Decrypts a value produced by encryptField.
 * Returns the original value unchanged if it is not an encrypted string.
 * Returns null and logs a warning if decryption fails (tampered / wrong key).
 */
function decryptField(encrypted) {
  if (!encrypted || typeof encrypted !== 'string') return encrypted;

  const parts = encrypted.split(':');
  if (parts.length !== 3) return encrypted; // plaintext passthrough (pre-migration data)

  try {
    const key     = _getKey();
    const [ivHex, authTagHex, ciphertext] = parts;

    const iv      = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv, { authTagLength: TAG_LENGTH });
    decipher.setAuthTag(authTag);

    let decrypted  = decipher.update(ciphertext, 'hex', 'utf8');
    decrypted     += decipher.final('utf8');

    return JSON.parse(decrypted);
  } catch (err) {
    console.warn('[Encryption] decryptField failed — returning null.', err.message);
    return null;
  }
}

// ── CV analysis encryption / decryption ─────────────────────────────────────

/**
 * Encrypts the sensitive text fields of a CV analysis object.
 * Score, readinessLevel, industry, analysisSource and links are left
 * in plaintext so they can be used for filtering / aggregation.
 */
function encryptAnalysis(analysis) {
  if (!analysis || typeof analysis !== 'object') return analysis;

  return {
    // plaintext — safe to query / aggregate
    score:          analysis.score,
    readinessLevel: analysis.readinessLevel,
    industry:       analysis.industry,
    analysisSource: analysis.analysisSource,
    links:          analysis.links,

    // encrypted — PII / sensitive narrative content
    summary:          encryptField(analysis.summary),
    about:            encryptField(analysis.about),
    extractedSkills:  encryptField(analysis.extractedSkills),
    missingSkills:    encryptField(analysis.missingSkills),
    marketKeywords:   encryptField(analysis.marketKeywords),
    strengths:        encryptField(analysis.strengths),
    weaknesses:       encryptField(analysis.weaknesses),
    suggestions:      encryptField(analysis.suggestions),
    recommendations:  encryptField(analysis.recommendations),
    missingKeywords:  encryptField(analysis.missingKeywords),
    achievements:     encryptField(analysis.achievements),
    education:        encryptField(analysis.education),
    experience:       encryptField(analysis.experience),
  };
}

/**
 * Decrypts a CV analysis object produced by encryptAnalysis.
 */
function decryptAnalysis(analysis) {
  if (!analysis || typeof analysis !== 'object') return analysis;

  return {
    // plaintext passthrough
    score:          analysis.score,
    readinessLevel: analysis.readinessLevel,
    industry:       analysis.industry,
    analysisSource: analysis.analysisSource,
    links:          analysis.links,

    // decrypted
    summary:         decryptField(analysis.summary),
    about:           decryptField(analysis.about),
    extractedSkills: decryptField(analysis.extractedSkills),
    missingSkills:   decryptField(analysis.missingSkills),
    marketKeywords:  decryptField(analysis.marketKeywords),
    strengths:       decryptField(analysis.strengths),
    weaknesses:      decryptField(analysis.weaknesses),
    suggestions:     decryptField(analysis.suggestions),
    recommendations: decryptField(analysis.recommendations),
    missingKeywords: decryptField(analysis.missingKeywords),
    achievements:    decryptField(analysis.achievements),
    education:       decryptField(analysis.education),
    experience:      decryptField(analysis.experience),
  };
}

// ── User profile encryption / decryption ────────────────────────────────────

/**
 * Encrypts PII profile fields on an incoming data object before DB write.
 * Only encrypts fields that are present — safe for partial updates (PATCH).
 *
 * Encrypted fields: phone, province, age, education, skills[], interests[]
 */
function encryptProfile(data) {
  if (!data || typeof data !== 'object') return data;

  const result = { ...data };

  // Scalar string fields
  for (const field of PROFILE_SCALAR_FIELDS) {
    if (result[field] !== undefined) {
      result[field] = encryptField(result[field]);
    }
  }

  // Array fields — encrypt each element individually
  for (const field of PROFILE_ARRAY_FIELDS) {
    if (result[field] !== undefined) {
      result[field] = result[field].map(encryptField);
    }
  }

  // age — stored encrypted; Number is JSON-serialisable so encryptField handles it
  if (result.age !== undefined) {
    result.age = encryptField(result.age);
  }

  return result;
}

/**
 * Decrypts PII profile fields on a User document returned from the DB.
 * Accepts a Mongoose document or a plain object.
 * Restores age back to a Number after decryption.
 */
function decryptProfile(user) {
  if (!user) return null;

  const obj = user.toObject ? user.toObject() : { ...user };

  // Scalar string fields
  for (const field of PROFILE_SCALAR_FIELDS) {
    obj[field] = decryptField(obj[field]) ?? null;
  }

  // Array fields
  for (const field of PROFILE_ARRAY_FIELDS) {
    obj[field] = (obj[field] ?? []).map(decryptField);
  }

  // Restore age to Number (was encrypted as a number via JSON.stringify)
  if (obj.age !== undefined && obj.age !== null) {
    const decrypted = decryptField(obj.age);
    obj.age = decrypted !== null ? Number(decrypted) : null;
  }

  return obj;
}

// ── Exports ──────────────────────────────────────────────────────────────────

module.exports = {
  encryptField,
  decryptField,
  encryptAnalysis,
  decryptAnalysis,
  encryptProfile,
  decryptProfile,
};
