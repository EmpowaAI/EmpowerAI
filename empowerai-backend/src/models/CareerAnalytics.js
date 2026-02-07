const mongoose = require('mongoose');

const careerAnalyticsSchema = new mongoose.Schema({
  career: { type: String, required: true, unique: true },
  count: { type: Number, default: 0 },
  lastSelectedAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('CareerAnalytics', careerAnalyticsSchema);
