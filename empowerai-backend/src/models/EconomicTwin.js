const mongoose = require('mongoose');

const economicTwinSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  skillVector: [Number], // Array of numbers [0-1] representing skill proficiency in 6 categories
  incomeProjections: {
    threeMonth: Number,
    sixMonth: Number,
    twelveMonth: Number
  },
  empowermentScore: Number,
  recommendedPaths: [{ type: String }], // Array of path names like 'freelancing', 'learnership'
  simulationHistory: [{
    paths: [String], // Changed from path to paths to match controller
    timestamp: Date,
    results: Object // Changed from projection to results to match controller
  }]
}, { timestamps: true });

module.exports = mongoose.model('EconomicTwin', economicTwinSchema);