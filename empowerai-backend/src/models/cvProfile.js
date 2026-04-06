const mongoose = require('mongoose');

/**
 * CvProfile — stores the AI analysis result for a user's uploaded CV.
 * Intentionally separate from User (identity-only).
 * One profile per user — upserted on every new upload.
 */
const cvProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true, // one profile per user, upserted on re-upload
      index: true,
    },

    // --- File metadata ---
    filename: {
      type: String,
      trim: true,
    },
    mimetype: {
      type: String,
      trim: true,
    },
    fileSize: {
      type: Number,
    },

    // --- Raw extracted text (capped to avoid bloating the document) ---
    rawText: {
      type: String,
      maxlength: 10000,
      default: '',
    },

    // --- AI analysis result ---
    analysis: {
      score: { type: Number, default: 0 },
      readinessLevel: { type: String, default: 'JUNIOR' },
      summary: { type: String, default: '' },
      about: { type: String, default: '' },
      industry: { type: String, default: 'general' },
      analysisSource: {
        type: String,
        enum: ['ai', 'fallback'],
        default: 'ai',
      },

      extractedSkills: [{ type: String }],
      missingSkills: [{ type: String }],
      marketKeywords: [{ type: String }],
      strengths: [{ type: String }],
      weaknesses: [{ type: String }],
      suggestions: [{ type: String }],
      recommendations: [{ type: String }],
      missingKeywords: [{ type: String }],
      achievements: [{ type: String }],

      education: [{ type: mongoose.Schema.Types.Mixed }],
      experience: [{ type: mongoose.Schema.Types.Mixed }],

      links: {
        linkedin: { type: Boolean, default: false },
        github: { type: Boolean, default: false },
        portfolio: { type: Boolean, default: false },
        driversLicence: { type: Boolean, default: false },
      },
    },

    // --- Status flags ---
    isComplete: {
      type: Boolean,
      default: false, // true once a full AI analysis (not fallback) is saved
    },
    isFallback: {
      type: Boolean,
      default: false, // true when saved from local fallback analysis
    },

    analyzedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true, // createdAt + updatedAt
  }
);

// Virtual: full name alias for populated user
cvProfileSchema.virtual('userId').get(function () {
  return this.user;
});

module.exports = mongoose.model('CvProfile', cvProfileSchema);
