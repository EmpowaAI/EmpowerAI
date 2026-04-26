const mongoose = require('mongoose');

const aiUsageLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    feature: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      index: true,
      
      enum: [
        'cv_analysis',
        'job_match',
        'interview_coach',
        'cover_letter',
        'learning_path',
        'economic_twin',
      ],
    },
    tokensUsed: {
      type: Number,
      default: 0,
      min: 0,
    },
    latencyMs: {
      type: Number,
      default: null,
    },
    isError: {
      type: Boolean,
      default: false,
      index: true,
    },
    errorMessage: {
      type: String,
      default: null,
    },
    modelUsed: {
      type: String,
      default: null,
    
    },
    promptTokens: {
      type: Number,
      default: null,
    },
    completionTokens: {
      type: Number,
      default: null,
    },
    // Optional: track input size or context for cost estimates
    inputSummary: {
      type: String,
      default: null,
      maxlength: 200,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for admin dashboard aggregations
aiUsageLogSchema.index({ userId: 1, createdAt: -1 });
aiUsageLogSchema.index({ feature: 1, createdAt: -1 });
aiUsageLogSchema.index({ createdAt: -1 });

module.exports = mongoose.model('AiUsageLog', aiUsageLogSchema);
