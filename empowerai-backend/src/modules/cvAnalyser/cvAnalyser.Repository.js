const CvProfile = require('./cvAnalyser.Model');
const {
  encryptAnalysis,
  decryptAnalysis,
  encryptField,
  decryptField,
} = require('../../utils/encryption.util');

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

// Safely JSON-stringify then encrypt a value
const encryptJson = (value) => {
  if (!value) return null;
  return encryptField(JSON.stringify(value));
};

// ── Map AI analyser output → model fields ─────────────────────────────────────
function mapAnalysisToSchema(aiAnalysis, targetRole, industry, isFallback) {
  const a = aiAnalysis || {};

  const ats       = a.ats_compatibility   || {};
  const overall   = a.overall_score       || {};
  const jobMatch  = a.job_match           || {};
  const candidate = a.candidate_info      || {};
  const missing   = a.missing_keywords    || {};
  const skills    = a.skills_analysis     || {};
  const grammar   = a.grammar_feedback    || {};
  const recruiter = a.recruiter_feedback  || {};
  const improve   = a.improvement_recommendations || {};
  const formatting = a.formatting_analysis || {};

  return {
    targetRole:   targetRole || '',
    industry:     industry   || 'general',
    analysisSource: isFallback ? 'fallback' : 'ai',

    // Scores
    atsScore:        ats.score        ?? 0,
    atsGrade:        ats.grade        ?? '',
    overallScore:    overall.total    ?? 0,
    jobMatchPercent: jobMatch.percentage ?? null,

    // Score breakdown
    scoreBreakdown: {
      formatting:      overall.breakdown?.formatting      ?? 0,
      contentQuality:  overall.breakdown?.content_quality ?? 0,
      readability:     overall.breakdown?.readability     ?? 0,
      professionalism: overall.breakdown?.professionalism ?? 0,
      grammar:         overall.breakdown?.grammar         ?? 0,
    },

    // Candidate info
    candidateInfo: {
      fullName:            candidate.full_name            ?? null,
      email:               candidate.email                ?? null,
      phone:               candidate.phone                ?? null,
      location:            candidate.location             ?? null,
      professionalSummary: candidate.professional_summary ?? '',
      links: {
        linkedin:  candidate.linkedin  ?? null,
        github:    candidate.github    ?? null,
        portfolio: candidate.portfolio ?? null,
      },
    },

    // Skills (encrypted JSON arrays)
    extractedSkills:    encryptJson([
      ...(skills.detected_technical || []),
      ...(skills.detected_soft      || []),
    ]),
    skillGaps:          encryptJson(skills.skill_gaps    || []),
    topStrengths:       encryptJson(skills.top_strengths || []),
    missingKeywords:    encryptJson({
      critical:          missing.critical          || [],
      recommended:       missing.recommended       || [],
      industry_specific: missing.industry_specific || [],
    }),
    matchingSkills:     encryptJson(jobMatch.matching_skills || []),

    // ATS issues (encrypted JSON arrays)
    parsingIssues:      encryptJson(ats.parsing_issues       || []),
    formattingProblems: encryptJson(ats.formatting_problems  || []),
    missingSections:    encryptJson(ats.missing_sections     || []),

    // Grammar
    grammarQuality:  grammar.overall_quality ?? '',
    grammarIssues:   encryptJson(grammar.issues || []),

    // Recruiter feedback
    recruiterVerdict:  recruiter.overall_verdict ?? '',
    recruiterFeedback: encryptJson(recruiter),

    // Recommendations
    improvementsCritical:     encryptJson(improve.critical       || []),
    improvementsHighPriority: encryptJson(improve.high_priority  || []),
    improvementsNiceToHave:   encryptJson(improve.nice_to_have   || []),

    // Structured data (encrypted JSON)
    education:      encryptJson(candidate.education      || []),
    experience:     encryptJson(candidate.experience     || []),
    projects:       encryptJson(candidate.projects       || []),
    certifications: encryptJson(candidate.certifications || []),

    // ── Subscription-gated fields ─────────────────────────────────────────────
    salaryPrediction:      encryptJson(a.salary_prediction        || null),
    careerRoadmap:         encryptJson(a.career_roadmap           || null),
    provinceEarnings:      encryptJson(a.province_earning_projection || null),
    marketBenchmarking:    encryptJson(a.market_benchmarking      || null),
    careerSimulation:      encryptJson(a.career_simulation        || null),
    interviewQuestions:    encryptJson(a.interview_questions      || null),
    linkedinSummary:       a.linkedin_summary
                             ? encryptField(a.linkedin_summary)
                             : null,
    coverLetter:           a.cover_letter
                             ? encryptField(a.cover_letter)
                             : null,
    careerRecommendations: encryptJson(a.career_recommendations   || null),
  };
}

// ── Save or update ────────────────────────────────────────────────────────────
async function saveOrUpdate({
  userId,
  filename,
  mimetype,
  fileSize,
  rawText,
  analysis,      // raw AI output
  targetRole,
  industry,
  isFallback = false,
}) {
  const isComplete = !isFallback && !!(analysis?.overall_score?.total || analysis?.score);

  const ttlDays = process.env.CV_PROFILE_TTL_DAYS
    ? toPositiveInt(process.env.CV_PROFILE_TTL_DAYS)
    : null;
  const expiresAt = ttlDays
    ? new Date(Date.now() + ttlDays * 24 * 60 * 60 * 1000)
    : null;

  const storeRawText = toBool(process.env.CV_STORE_RAW_TEXT, false);
  const rawTextToStore = storeRawText
    ? encryptField((rawText || '').slice(0, 10000))
    : '';

  const mappedAnalysis = mapAnalysisToSchema(analysis, targetRole, industry, isFallback);

  const profile = await CvProfile.findOneAndUpdate(
    { user: userId },
    {
      $set: {
        user: userId,
        filename,
        mimetype,
        fileSize,
        rawText: rawTextToStore,
        analysis: mappedAnalysis,
        isComplete,
        isFallback: !!isFallback,
        analyzedAt: new Date(),
        lastAnalyzedAt: new Date(),
        expiresAt,
      },
      $inc: { analysisCount: 1 },
    },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  return _withDecryptedAnalysis(profile);
}

// ── Save revamp ───────────────────────────────────────────────────────────────
async function saveRevamp({ userId, revampData }) {
  const r = revampData?.revamped_cv || revampData || {};

  const profile = await CvProfile.findOneAndUpdate(
    { user: userId },
    {
      $set: {
        'revamp.revampedAt': new Date(),
        'revamp.plainTextCv': revampData?.plain_text_cv
          ? encryptField(revampData.plain_text_cv)
          : null,
        'revamp.revampSummary': revampData?.revamp_summary
          ? encryptField(revampData.revamp_summary)
          : null,
        'revamp.revampedCv': encryptJson(r),
      },
    },
    {
      new: true,
      upsert: true,              // 🔥 CRITICAL FIX
      setDefaultsOnInsert: true
    }
  );

  if (!profile) {
    throw new Error('Failed to save revamp: profile not found or created');
  }

  return _withDecryptedAnalysis(profile);
}

// ── Queries ───────────────────────────────────────────────────────────────────
async function findByUserId(userId) {
  const profile = await CvProfile.findOne({ user: userId }).lean();
  if (!profile) return null;
  return _withDecryptedAnalysis(profile);
}

async function getAnalysisCount(userId) {
  const profile = await CvProfile.findOne({ user: userId })
    .select('analysisCount')
    .lean();
  return profile?.analysisCount ?? 0;
}

async function hasCompleteProfile(userId) {
  const profile = await CvProfile.findOne({ user: userId, isComplete: true })
    .select('_id')
    .lean();
  return !!profile;
}

async function deleteByUserId(userId) {
  return CvProfile.deleteOne({ user: userId });
}

// ── Decrypt on read ───────────────────────────────────────────────────────────
function _withDecryptedAnalysis(profile) {
  if (!profile) return null;

  const plain = typeof profile.toObject === 'function'
    ? profile.toObject()
    : { ...profile };

  if (plain.analysis) {
    const a = plain.analysis;

    // Decrypt JSON array/object fields
    const decryptJson = (val) => {
      if (!val) return val;
      try {
        const decrypted = decryptField(val);
        return JSON.parse(decrypted);
      } catch {
        return val;
      }
    };

    a.extractedSkills    = decryptJson(a.extractedSkills);
    a.skillGaps          = decryptJson(a.skillGaps);
    a.topStrengths       = decryptJson(a.topStrengths);
    a.missingKeywords    = decryptJson(a.missingKeywords);
    a.matchingSkills     = decryptJson(a.matchingSkills);
    a.parsingIssues      = decryptJson(a.parsingIssues);
    a.formattingProblems = decryptJson(a.formattingProblems);
    a.missingSections    = decryptJson(a.missingSections);
    a.grammarIssues      = decryptJson(a.grammarIssues);
    a.recruiterFeedback  = decryptJson(a.recruiterFeedback);
    a.improvementsCritical      = decryptJson(a.improvementsCritical);
    a.improvementsHighPriority  = decryptJson(a.improvementsHighPriority);
    a.improvementsNiceToHave    = decryptJson(a.improvementsNiceToHave);
    a.education      = decryptJson(a.education);
    a.experience     = decryptJson(a.experience);
    a.projects       = decryptJson(a.projects);
    a.certifications = decryptJson(a.certifications);

    // Subscription-gated
    a.salaryPrediction      = decryptJson(a.salaryPrediction);
    a.careerRoadmap         = decryptJson(a.careerRoadmap);
    a.provinceEarnings      = decryptJson(a.provinceEarnings);
    a.marketBenchmarking    = decryptJson(a.marketBenchmarking);
    a.careerSimulation      = decryptJson(a.careerSimulation);
    a.interviewQuestions    = decryptJson(a.interviewQuestions);
    a.careerRecommendations = decryptJson(a.careerRecommendations);

    if (a.linkedinSummary) {
      try { a.linkedinSummary = decryptField(a.linkedinSummary); } catch {}
    }
    if (a.coverLetter) {
      try { a.coverLetter = decryptField(a.coverLetter); } catch {}
    }
  }

  // Decrypt revamp fields
  if (plain.revamp) {
    const rv = plain.revamp;
    if (rv.plainTextCv) {
      try { rv.plainTextCv = decryptField(rv.plainTextCv); } catch {}
    }
    if (rv.revampSummary) {
      try { rv.revampSummary = decryptField(rv.revampSummary); } catch {}
    }
    if (rv.revampedCv) {
      try { rv.revampedCv = JSON.parse(decryptField(rv.revampedCv)); } catch {}
    }
  }

  if (plain.rawText && typeof plain.rawText === 'string' && plain.rawText.includes(':')) {
    plain.rawText = decryptField(plain.rawText) ?? '';
  }

  return plain;
}

module.exports = {
  saveOrUpdate,
  saveRevamp,
  findByUserId,
  getAnalysisCount,
  hasCompleteProfile,
  deleteByUserId,
};
