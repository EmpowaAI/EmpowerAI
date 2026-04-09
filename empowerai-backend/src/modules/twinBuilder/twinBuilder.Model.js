const mongoose = require('mongoose');

/**
 * =========================
 * Chat Message Schema
 * =========================
 */
const chatMessageSchema = new mongoose.Schema(
  {
    role: { type: String, enum: ['user', 'assistant'], required: true },
    content: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
  },
  { _id: false }
);

/**
 * =========================
 * Analysis Snapshot Schema
 * =========================
 * Stored ONLY as latest + optional snapshot reference
 */
const analysisSnapshotSchema = new mongoose.Schema(
  {
    source: {
      type: String,
      enum: ['cv_analysis', 'ai_enrichment', 'market_engine'],
      required: true,
    },

    employabilityScore: { type: Number, default: 0 },

    skills: {
      core: [{ type: String }],
      missing: [{ type: String }],
      extracted: [{ type: String }],
    },

    swot: {
      strengths: [{ type: String }],
      weaknesses: [{ type: String }],
      opportunities: [{ type: String }],
      threats: [{ type: String }],
    },

    recommendations: [{ type: String }],

    metadata: {
      confidenceScore: Number,
      modelVersion: String,
    },

    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

/**
 * =========================
 * Economic Twin Schema
 * =========================
 */
const economicTwinSchema = new mongoose.Schema(
  {
    // 🔗 Core Identity
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },

    cvProfile: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CvProfile',
      required: true,
    },

    /**
     * =========================
     * CORE AI STATE (single source of truth)
     * =========================
     */
    analysis: {
      latest: analysisSnapshotSchema,
    },

    /**
     * =========================
     * Derived Identity (computed, not user input)
     * =========================
     */
    identity: {
      currentRole: String,
      targetRole: String,

      seniorityLevel: {
        type: String,
        enum: ['ENTRY', 'JUNIOR', 'MID', 'SENIOR', 'LEAD'],
        default: 'ENTRY',
      },

      industry: String,
    },

    /**
     * =========================
     * Economic Engine (computed fields only)
     * =========================
     */
    economy: {
      employabilityScore: { type: Number, default: 0 },
      marketValueScore: { type: Number, default: 0 },

      demandLevel: {
        type: String,
        enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
        default: 'LOW',
      },

      incomePotentialRange: {
        min: Number,
        max: Number,
        currency: { type: String, default: 'ZAR' },
      },
    },

    /**
     * =========================
     * Skills Layer (derived ONLY from analysis)
     * =========================
     */
    skills: {
      core: [{ type: String }],
      missing: [{ type: String }],
      emerging: [{ type: String }],
      monetizable: [{ type: String }],
    },

    /**
     * =========================
     * Market Intelligence Layer
     * =========================
     */
    market: {
      trendingSkills: [{ type: String }],
      decliningSkills: [{ type: String }],
      jobTitlesMapped: [{ type: String }],
      competitorRoles: [{ type: String }],
    },

    /**
     * =========================
     * AI Reasoning Layer (SWOT output only)
     * =========================
     */
    intelligence: {
      strengths: [{ type: String }],
      weaknesses: [{ type: String }],
      opportunities: [{ type: String }],
      threats: [{ type: String }],
      recommendations: [{ type: String }],
    },

    /**
     * =========================
     * CHAT (⚠️ should move to separate collection later)
     * =========================
     */
    chatHistory: {
      type: [chatMessageSchema],
      default: [],
    },

    /**
     * =========================
     * SIMULATIONS (structured moving forward)
     * =========================
     */
    simulationHistory: [
      {
        scenario: String,
        input: mongoose.Schema.Types.Mixed,
        output: mongoose.Schema.Types.Mixed,
        createdAt: { type: Date, default: Date.now },
      },
    ],

    /**
     * =========================
     * LIFECYCLE CONTROL
     * =========================
     */
    evolution: {
      version: { type: Number, default: 1 },

      lastUpdatedBy: {
        type: String,
        enum: [
          'cv_analysis',
          'ai_enrichment',
          'market_engine',
          'twin_builder',
        ],
        default: 'cv_analysis',
      },

      confidenceScore: { type: Number, default: 0 },
    },

    status: {
      type: String,
      enum: ['ACTIVE', 'INCOMPLETE', 'NEEDS_UPDATE'],
      default: 'INCOMPLETE',
    },

    lastCalculatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

/**
 * =========================
 * INDEXES (important for scale)
 * =========================
 */
economicTwinSchema.index({ user: 1 });
economicTwinSchema.index({ status: 1 });
economicTwinSchema.index({ 'evolution.version': 1 });

module.exports = mongoose.model('EconomicTwin', economicTwinSchema);