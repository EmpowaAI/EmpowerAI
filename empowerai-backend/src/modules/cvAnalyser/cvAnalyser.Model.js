const mongoose = require('mongoose');

const cvProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },

    // ── File metadata ─────────────────────────────────────────────────────────
    filename: { type: String, trim: true },
    mimetype: { type: String, trim: true },
    fileSize: { type: Number },

    // ── Raw CV text (encrypted at rest if CV_STORE_RAW_TEXT=true) ─────────────
    rawText: { type: String, maxlength: 20000, default: '' },

    // ── Core analysis ─────────────────────────────────────────────────────────
    analysis: {
      targetRole:      { type: String, default: '' },
      industry:        { type: String, default: 'general' },
      analysisSource:  { type: String, enum: ['ai', 'fallback'], default: 'ai' },

      // Scores
      atsScore:        { type: Number, default: 0 },
      atsGrade:        { type: String, default: '' },
      overallScore:    { type: Number, default: 0 },
      jobMatchPercent: { type: Number, default: null },

      // Score breakdown
      scoreBreakdown: {
        formatting:     { type: Number, default: 0 },
        contentQuality: { type: Number, default: 0 },
        readability:    { type: Number, default: 0 },
        professionalism:{ type: Number, default: 0 },
        grammar:        { type: Number, default: 0 },
      },

      // Candidate info
      candidateInfo: {
        fullName:            { type: String, default: null },
        email:               { type: String, default: null },
        phone:               { type: String, default: null },
        location:            { type: String, default: null },
        professionalSummary: { type: String, default: '' },
        links: {
          linkedin:  { type: String, default: null },
          github:    { type: String, default: null },
          portfolio: { type: String, default: null },
        },
      },

      // Skills — stored as encrypted strings, decrypted to arrays on read
      extractedSkills:    { type: String, default: '' }, // detected_technical + detected_soft
      skillGaps:          { type: String, default: '' }, // skills_analysis.skill_gaps
      topStrengths:       { type: String, default: '' }, // skills_analysis.top_strengths
      missingKeywords:    { type: String, default: '' }, // missing_keywords (all tiers)
      matchingSkills:     { type: String, default: '' }, // job_match.matching_skills

      // ATS & formatting issues
      parsingIssues:      { type: String, default: '' }, // ats_compatibility.parsing_issues
      formattingProblems: { type: String, default: '' }, // ats_compatibility.formatting_problems
      missingSections:    { type: String, default: '' }, // ats_compatibility.missing_sections

      // Feedback
      grammarQuality:     { type: String, default: '' }, // grammar_feedback.overall_quality
      grammarIssues:      { type: String, default: '' }, // grammar_feedback.issues
      recruiterVerdict:   { type: String, default: '' }, // recruiter_feedback.overall_verdict
      recruiterFeedback:  { type: String, default: '' }, // recruiter_feedback (full)

      // Recommendations
      improvementsCritical:    { type: String, default: '' },
      improvementsHighPriority:{ type: String, default: '' },
      improvementsNiceToHave:  { type: String, default: '' },

      // Education & experience (stored as JSON strings, encrypted)
      education:  { type: String, default: '' },
      experience: { type: String, default: '' },
      projects:   { type: String, default: '' },
      certifications: { type: String, default: '' },

      // ── Subscription-gated fields ─────────────────────────────────────────
      // Available to subscribed users only — stored but access controlled at service layer

      salaryPrediction:       { type: String, default: null }, // full salary_prediction object
      careerRoadmap:          { type: String, default: null }, // career_roadmap object
      provinceEarnings:       { type: String, default: null }, // province_earning_projection
      marketBenchmarking:     { type: String, default: null }, // market_benchmarking object
      careerSimulation:       { type: String, default: null }, // career_simulation object
      interviewQuestions:     { type: String, default: null }, // interview_questions object
      linkedinSummary:        { type: String, default: null }, // linkedin_summary string
      coverLetter:            { type: String, default: null }, // cover_letter string
      careerRecommendations:  { type: String, default: null }, // career_recommendations object
    },

    // ── Revamp (subscription-gated) ───────────────────────────────────────────
    revamp: {
      revampedAt:    { type: Date, default: null },
      plainTextCv:   { type: String, default: null }, // plain_text_cv for copy-paste
      revampSummary: { type: String, default: null }, // revamp_summary string
      revampedCv:    { type: String, default: null }, // full revamped_cv JSON (encrypted)
    },

    // ── Status ────────────────────────────────────────────────────────────────
    isComplete:  { type: Boolean, default: false },
    isFallback:  { type: Boolean, default: false },
    analyzedAt:  { type: Date, default: Date.now },

    // ── Analysis usage count (for free tier limit of 3) ───────────────────────
    analysisCount: { type: Number, default: 0 },
    lastAnalyzedAt: { type: Date, default: null },

    // ── TTL ───────────────────────────────────────────────────────────────────
    expiresAt: { type: Date, default: null, expires: 0, index: true },
  },
  { timestamps: true }
);

cvProfileSchema.virtual('userId').get(function () {
  return this.user;
});

module.exports = mongoose.model('CvProfile', cvProfileSchema);
