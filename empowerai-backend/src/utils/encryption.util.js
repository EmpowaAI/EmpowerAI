'use strict';

const crypto = require('crypto');

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;   
const TAG_LENGTH = 16;  

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

function encryptField(value) {
  if (value === null || value === undefined) return value;

  const key = _getKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv, { authTagLength: TAG_LENGTH });

  const plaintext = JSON.stringify(value);
  let ciphertext = cipher.update(plaintext, 'utf8', 'hex');
  ciphertext += cipher.final('hex');

  const authTag = cipher.getAuthTag().toString('hex');

  return `${iv.toString('hex')}:${authTag}:${ciphertext}`;
}


function decryptField(encrypted) {
  if (!encrypted || typeof encrypted !== 'string') return encrypted;

  const parts = encrypted.split(':');
  if (parts.length !== 3) return encrypted;

  try {
    const key = _getKey();
    const [ivHex, authTagHex, ciphertext] = parts;

    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv, { authTagLength: TAG_LENGTH });
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(ciphertext, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return JSON.parse(decrypted);
  } catch (err) {
    
    console.warn('[Encryption] decryptField failed — returning null.', err.message);
    return null;
  }
}

function encryptAnalysis(analysis) {
  if (!analysis || typeof analysis !== 'object') return analysis;

  return {
    score:          analysis.score,
    readinessLevel: analysis.readinessLevel,
    industry:       analysis.industry,
    analysisSource: analysis.analysisSource,
    links:          analysis.links,

    summary:          encryptField(analysis.summary),
    about:            encryptField(analysis.about),

    extractedSkills:    encryptField(analysis.extractedSkills),
    missingSkills:      encryptField(analysis.missingSkills),
    marketKeywords:     encryptField(analysis.marketKeywords),
    strengths:          encryptField(analysis.strengths),
    weaknesses:         encryptField(analysis.weaknesses),
    suggestions:        encryptField(analysis.suggestions),
    recommendations:    encryptField(analysis.recommendations),
    missingKeywords:    encryptField(analysis.missingKeywords),
    achievements:       encryptField(analysis.achievements),

    education:  encryptField(analysis.education),
    experience: encryptField(analysis.experience),
  };
}

function decryptAnalysis(analysis) {
  if (!analysis || typeof analysis !== 'object') return analysis;

  return {
    score:          analysis.score,
    readinessLevel: analysis.readinessLevel,
    industry:       analysis.industry,
    analysisSource: analysis.analysisSource,
    links:          analysis.links,

    summary: decryptField(analysis.summary),
    about:   decryptField(analysis.about),

    extractedSkills:    decryptField(analysis.extractedSkills),
    missingSkills:      decryptField(analysis.missingSkills),
    marketKeywords:     decryptField(analysis.marketKeywords),
    strengths:          decryptField(analysis.strengths),
    weaknesses:         decryptField(analysis.weaknesses),
    suggestions:        decryptField(analysis.suggestions),
    recommendations:    decryptField(analysis.recommendations),
    missingKeywords:    decryptField(analysis.missingKeywords),
    achievements:       decryptField(analysis.achievements),

    education:  decryptField(analysis.education),
    experience: decryptField(analysis.experience),
  };
}

module.exports = {
  encryptField,
  decryptField,
  encryptAnalysis,
  decryptAnalysis,
};
