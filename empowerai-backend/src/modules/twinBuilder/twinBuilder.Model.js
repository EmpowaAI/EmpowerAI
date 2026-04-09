const mongoose = require('mongoose');

const chatMessageSchema = new mongoose.Schema(
  {
    role: { type: String, enum: ['user', 'assistant'], required: true },
    content: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
  },
  { _id: false }
);

const analysisSnapshotSchema = new mongoose.Schema(
  {
    source: {
      type: String,
      enum: ['cv_analysis', 'ai_enrichment', 'market_engine'],
      required: true,
    },

    employabilityScore: Number,
    skills: {
      core: [String],
      missing: [String],
      extracted: [String],
    },

    swot: {
      strengths: [String],
      weaknesses: [String],
      opportunities: [String],
      threats: [String],
    },

    recommendations: [String],

    metadata: {
      confidenceScore: Number,
      modelVersion: String,
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const economicTwinSchema = new mongoose.Schema(
  {
    // 🔗 User link
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },

    // 🔗 Primary CV source (MUST exist for twin creation)
    cvProfile: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CvProfile',
      required: true,
    },

    // 📦 RAW ANALYSIS (THIS IS NOW THE CORE)
    analysis: {
      latest: analysisSnapshotSchema,
      history: [analysisSnapshotSchema],
    },

    // 🧠 Derived identity (computed from analysis)
    identity: {
      currentRole: { type: String, default: null },
      targetRole: { type: String, default: null },

      seniorityLevel: {
        type: String,
        enum: ['ENTRY', 'JUNIOR', 'MID', 'SENIOR', 'LEAD'],
        default: 'ENTRY',
      },

      industry: { type: String, default: null },
    },

    // 💰 Derived economic model (NOT manually filled)
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

    // 🧠 Skills derived from analysis (NOT free text)
    skills: {
      core: [{ type: String }],
      missing: [{ type: String }],
      emerging: [{ type: String }],
      monetizable: [{ type: String }],
    },

    // 📊 Market layer (optional enrichment)
    market: {
      trendingSkills: [{ type: String }],
      decliningSkills: [{ type: String }],
      jobTitlesMapped: [{ type: String }],
      competitorRoles: [{ type: String }],
    },

    // 🧭 AI reasoning (SWOT from analysis only)
    intelligence: {
      strengths: [{ type: String }],
      weaknesses: [{ type: String }],
      opportunities: [{ type: String }],
      threats: [{ type: String }],
      recommendations: [{ type: String }],
    },

    // 💬 Chat memory
    chatHistory: {
      type: [chatMessageSchema],
      default: [],
    },

    // 📈 Simulation history
    simulationHistory: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    },

    // 🔄 Evolution tracking (STRICT + CONTROLLED)
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

    // ⚙️ Lifecycle state
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

module.exports = mongoose.model('EconomicTwin', economicTwinSchema);
