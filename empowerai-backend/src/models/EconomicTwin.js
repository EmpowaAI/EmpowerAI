const mongoose = require('mongoose');

const economicTwinSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  skillVector: [{
    skill: String,
    proficiency: Number, // 1-10
    category: String
  }],
  incomeProjections: {
    threeMonth: Number,
    sixMonth: Number,
    twelveMonth: Number
  },
  empowermentScore: Number,
  recommendedPaths: [{
    pathType: String, // 'freelancing', 'learnership', 'course', 'job'
    title: String,
    estimatedIncome: Number,
    confidence: Number,
    requirements: [String],
    timeline: String
  }],
  simulationHistory: [{
    path: String,
    timestamp: Date,
    projection: Object
  }]
}, { timestamps: true });

module.exports = mongoose.model('EconomicTwin', economicTwinSchema);