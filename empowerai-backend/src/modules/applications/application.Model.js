const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  opportunityId: { type: mongoose.Schema.Types.ObjectId, ref: 'Opportunity', required: true, index: true },
  status: { type: String, enum: ['applied'], default: 'applied' },
  source: { type: String, enum: ['manual', 'adzuna', 'indeed', 'rss'], default: 'manual' },
  applicationUrl: String
}, { timestamps: true });

applicationSchema.index({ userId: 1, opportunityId: 1 }, { unique: true });

module.exports = mongoose.model('Application', applicationSchema);
