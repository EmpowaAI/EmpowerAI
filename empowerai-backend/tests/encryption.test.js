'use strict';

// Supply a valid 64-char hex key for the test suite
const TEST_KEY = 'a'.repeat(64);

beforeAll(() => {
  process.env.DATA_ENCRYPTION_KEY = TEST_KEY;
});

afterAll(() => {
  delete process.env.DATA_ENCRYPTION_KEY;
});

const {
  encryptField,
  decryptField,
  encryptProfile,
  decryptProfile,
  encryptAnalysis,
  decryptAnalysis,
} = require('../src/utils/encryption.util');

// ── encryptField / decryptField ───────────────────────────────────────────────

describe('encryptField / decryptField — round-trip', () => {
  test('round-trips a plain string', () => {
    const original = 'Cape Town';
    expect(decryptField(encryptField(original))).toBe(original);
  });

  test('round-trips a number', () => {
    expect(decryptField(encryptField(24))).toBe(24);
  });

  test('round-trips an array', () => {
    const arr = ['React', 'Node.js', 'Python'];
    expect(decryptField(encryptField(arr))).toEqual(arr);
  });

  test('round-trips an object', () => {
    const obj = { a: 1, b: 'two' };
    expect(decryptField(encryptField(obj))).toEqual(obj);
  });

  test('produces a ciphertext in the expected <iv>:<tag>:<cipher> format', () => {
    const encrypted = encryptField('hello');
    const parts = encrypted.split(':');
    expect(parts).toHaveLength(3);
    // IV should be 24 hex chars (12 bytes × 2)
    expect(parts[0]).toHaveLength(24);
    // Auth tag should be 32 hex chars (16 bytes × 2)
    expect(parts[1]).toHaveLength(32);
  });

  test('two encryptions of the same value produce different ciphertexts (random IV)', () => {
    const a = encryptField('same value');
    const b = encryptField('same value');
    expect(a).not.toBe(b);
  });

  test('passes null through unchanged', () => {
    expect(encryptField(null)).toBeNull();
    expect(decryptField(null)).toBeNull();
  });

  test('passes undefined through unchanged', () => {
    expect(encryptField(undefined)).toBeUndefined();
  });

  test('decryptField returns plaintext strings that are not in <iv>:<tag>:<cipher> format', () => {
    // Pre-migration data stored as plain text should survive gracefully
    expect(decryptField('Johannesburg')).toBe('Johannesburg');
  });

  test('decryptField returns null and does not throw on a tampered ciphertext', () => {
    const encrypted = encryptField('secret');
    const parts = encrypted.split(':');
    const tampered = [parts[0], parts[1], 'deadbeef'].join(':');
    expect(decryptField(tampered)).toBeNull();
  });
});

// ── encryptProfile / decryptProfile ──────────────────────────────────────────

describe('encryptProfile / decryptProfile — round-trip', () => {
  const profile = {
    name: 'Zanele Mokoena',
    email: 'zanele@example.com',
    phone: '+27 71 234 5678',
    province: 'Gauteng',
    education: 'BCom Information Systems',
    skills: ['React', 'Node.js'],
    interests: ['FinTech', 'EdTech'],
    age: 24,
    bio: 'Developer based in Soweto.',
  };

  test('encrypts and decrypts all PII fields correctly', () => {
    const encrypted = encryptProfile(profile);
    const decrypted = decryptProfile(encrypted);

    expect(decrypted.phone).toBe(profile.phone);
    expect(decrypted.province).toBe(profile.province);
    expect(decrypted.education).toBe(profile.education);
    expect(decrypted.skills).toEqual(profile.skills);
    expect(decrypted.interests).toEqual(profile.interests);
    expect(decrypted.age).toBe(profile.age);
  });

  test('does not encrypt non-PII fields (name, email)', () => {
    const encrypted = encryptProfile(profile);
    // name and email are not in the PII list — they should be unchanged
    expect(encrypted.name).toBe(profile.name);
    expect(encrypted.email).toBe(profile.email);
  });

  test('encrypted phone is not the same as plain phone', () => {
    const encrypted = encryptProfile(profile);
    expect(encrypted.phone).not.toBe(profile.phone);
  });

  test('age round-trips as a Number, not a string', () => {
    const decrypted = decryptProfile(encryptProfile(profile));
    expect(typeof decrypted.age).toBe('number');
    expect(decrypted.age).toBe(24);
  });

  test('partial update (PATCH) — only present fields are encrypted', () => {
    const patch = { name: 'Sipho', skills: ['SQL'] };
    const encrypted = encryptProfile(patch);
    // name not in PII list — unchanged
    expect(encrypted.name).toBe('Sipho');
    // skills IS in PII list — each element should be encrypted
    expect(encrypted.skills[0]).not.toBe('SQL');
  });

  test('returns null for a null input', () => {
    expect(decryptProfile(null)).toBeNull();
  });
});

// ── encryptAnalysis / decryptAnalysis ─────────────────────────────────────────

describe('encryptAnalysis / decryptAnalysis — round-trip', () => {
  const analysis = {
    score: 72,
    readinessLevel: 'Intermediate',
    industry: 'Technology',
    analysisSource: 'azure',
    links: { linkedin: true, github: false },
    summary: 'Strong React developer with 3 years experience.',
    about: 'Based in Cape Town.',
    extractedSkills: ['React', 'TypeScript'],
    missingSkills: ['Docker'],
    strengths: ['Communication'],
    weaknesses: ['Limited backend experience'],
    suggestions: ['Add more projects'],
    recommendations: ['Complete a cloud certification'],
    missingKeywords: ['AWS', 'Kubernetes'],
    achievements: ['Built an award-winning app'],
    education: ['BSc Computer Science'],
    experience: ['Junior Developer at Telkom 2021–2023'],
    marketKeywords: ['React', 'Frontend'],
  };

  test('plaintext fields (score, readinessLevel, etc.) are not encrypted', () => {
    const encrypted = encryptAnalysis(analysis);
    expect(encrypted.score).toBe(72);
    expect(encrypted.readinessLevel).toBe('Intermediate');
    expect(encrypted.industry).toBe('Technology');
    expect(encrypted.analysisSource).toBe('azure');
    expect(encrypted.links).toEqual(analysis.links);
  });

  test('narrative fields are encrypted (not equal to original)', () => {
    const encrypted = encryptAnalysis(analysis);
    expect(encrypted.summary).not.toBe(analysis.summary);
    expect(encrypted.about).not.toBe(analysis.about);
  });

  test('full round-trip restores all fields', () => {
    const result = decryptAnalysis(encryptAnalysis(analysis));
    expect(result.summary).toBe(analysis.summary);
    expect(result.extractedSkills).toEqual(analysis.extractedSkills);
    expect(result.missingSkills).toEqual(analysis.missingSkills);
    expect(result.strengths).toEqual(analysis.strengths);
    expect(result.achievements).toEqual(analysis.achievements);
    expect(result.education).toEqual(analysis.education);
  });
});
