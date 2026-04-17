const mongoose = require('mongoose');

const chatMessageSchema = new mongoose.Schema(
  {
    role:      { type: String, enum: ['user', 'assistant'], required: true },
    content:   { type: String, required: true }, // stored encrypted
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
    employabilityScore: { type: Number, default: 0 },
    skills: {
      core:      [{ type: String }],
      missing:   [{ type: String }],
      extracted: [{ type: String }],
    },
    swot: {
      strengths:     [{ type: String }],
      weaknesses:    [{ type: String }],
      opportunities: [{ type: String }],
      threats:       [{ type: String }],
    },
    recommendations: [{ type: String }],
    metadata: {
      confidenceScore: Number,
      modelVersion:    String,
    },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);


const economicTwinSchema = new mongoose.Schema(
  {
   
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

  
    analysis: {
      latest: { type: String, default: '' }, 
    },


    identity: {
      currentRole: { type: String, default: '' }, 
      targetRole:  { type: String, default: '' }, 

      seniorityLevel: {                            
        type: String,
        enum: ['ENTRY', 'JUNIOR', 'MID', 'SENIOR', 'LEAD'],
        default: 'ENTRY',
      },
      industry: { type: String, default: '' },    
    },

   
    economy: {
      employabilityScore: { type: Number, default: 0 },
      marketValueScore:   { type: Number, default: 0 },
      demandLevel: {
        type: String,
        enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
        default: 'LOW',
      },
      incomePotentialRange: {
        min:      Number,
        max:      Number,
        currency: { type: String, default: 'ZAR' },
      },
    },

   
    skills: {
      core:        { type: String, default: '' }, 
      missing:     { type: String, default: '' }, 
      emerging:    { type: String, default: '' }, 
      monetizable: { type: String, default: '' }, 
    },

   
    market: {
      trendingSkills:  { type: String, default: '' }, 
      decliningSkills: { type: String, default: '' }, 
      jobTitlesMapped: { type: String, default: '' }, 
      competitorRoles: { type: String, default: '' }, 
    },

   
    intelligence: {
      strengths:       { type: String, default: '' }, 
      weaknesses:      { type: String, default: '' }, 
      opportunities:   { type: String, default: '' }, 
      threats:         { type: String, default: '' },
      recommendations: { type: String, default: '' }, 
    },


    chatHistory: {
      type: [chatMessageSchema],
      default: [],
    },

    simulationHistory: [
      {
        scenario:  String,
        input:     { type: String, default: '' }, // encrypted Mixed
        output:    { type: String, default: '' }, // encrypted Mixed
        createdAt: { type: Date, default: Date.now },
      },
    ],

    evolution: {
      version: { type: Number, default: 1 },
      lastUpdatedBy: {
        type: String,
        enum: ['cv_analysis', 'ai_enrichment', 'market_engine', 'twin_builder'],
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


economicTwinSchema.index({ user: 1 });
economicTwinSchema.index({ status: 1 });
economicTwinSchema.index({ 'evolution.version': 1 });

module.exports = mongoose.model('EconomicTwin', economicTwinSchema);
