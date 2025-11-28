const mongoose = require('mongoose');

const economicTwinSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  skillVector: {
    type: [Number],
    required: true,
  },
  incomeProjection: {
    threeMonth: { type: Number, default: 0 },
    sixMonth: { type: Number, default: 0 },
    twelveMonth: { type: Number, default: 0 },
  },
  empowermentScore: {
    type: Number,
    default: 0,
  },
  growthModel: {
    skillGrowth: [Number],
    employabilityIndex: Number,
    recommendedPaths: [String],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('EconomicTwin', economicTwinSchema);

