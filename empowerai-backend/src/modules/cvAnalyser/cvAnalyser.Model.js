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

   
    rawText: {
      type: String,
      maxlength: 20000, 
      default: '',
    },

   
    analysis: {
    
      score:          { type: Number,  default: 0 },
      readinessLevel: { type: String,  default: 'JUNIOR' },
      industry:       { type: String,  default: 'general' },
      analysisSource: {
        type: String,
        enum: ['ai', 'fallback'],
        default: 'ai',
      },
      links: {
        linkedin:       { type: Boolean, default: false },
        github:         { type: Boolean, default: false },
        portfolio:      { type: Boolean, default: false },
        driversLicence: { type: Boolean, default: false },
      },

      
      summary: { type: String, default: '' },
      about:   { type: String, default: '' },

      extractedSkills:  { type: String, default: '' },
      missingSkills:    { type: String, default: '' },
      marketKeywords:   { type: String, default: '' },
      strengths:        { type: String, default: '' },
      weaknesses:       { type: String, default: '' },
      suggestions:      { type: String, default: '' },
      recommendations:  { type: String, default: '' },
      missingKeywords:  { type: String, default: '' },
      achievements:     { type: String, default: '' },

      
      education:  { type: String, default: '' },
      experience: { type: String, default: '' },
    },

   
    isComplete: {
      type: Boolean,
      default: false, 
    },
    isFallback: {
      type: Boolean,
      default: false, 
    },

    analyzedAt: {
      type: Date,
      default: Date.now,
    },

    expiresAt: {
      type: Date,
      default: null,
      expires: 0,
      index: true,
    },
  },
  {
    timestamps: true, 
  }
);


cvProfileSchema.virtual('userId').get(function () {
  return this.user;
});

module.exports = mongoose.model('CvProfile', cvProfileSchema);
