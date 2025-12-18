const mongoose = require('mongoose');

const economicTwinSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true, 
    unique: true,
    index: true 
  },
  skillVector: [Number], // Array of numbers [0-1] representing skill proficiency in 6 categories
  incomeProjections: {
    threeMonth: Number,
    sixMonth: Number,
    twelveMonth: Number
  },
  empowermentScore: { type: Number, index: true },
  recommendedPaths: [{ type: String }], // Array of path names like 'freelancing', 'learnership'
  simulationHistory: [{
    paths: [String], // Changed from path to paths to match controller
    timestamp: { type: Date, index: true },
    results: Object // Changed from projection to results to match controller
  }]
}, { 
  timestamps: true,
  // Index on createdAt for sorting
  indexes: [
    { createdAt: -1 }
  ]
});

module.exports = mongoose.model('EconomicTwin', economicTwinSchema);