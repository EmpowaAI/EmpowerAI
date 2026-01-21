const mongoose = require('mongoose');

const opportunitySchema = new mongoose.Schema({
  title: { type: String, required: true },
  type: { type: String, enum: ['learnership', 'bursary', 'internship', 'job', 'freelance'] },
  company: String,
  location: String,
  province: [String],
  description: String,
  requirements: [String],
  skills: [String],
  salaryRange: {
    min: Number,
    max: Number
  },
  deadline: Date,
  applicationUrl: String,
  isActive: { type: Boolean, default: true },
  source: { type: String, enum: ['rss', 'adzuna', 'indeed', 'manual'], default: 'manual' },
  externalId: String // ID from external source for deduplication
}, { timestamps: true });

// Index for deduplication
opportunitySchema.index({ externalId: 1, source: 1 });
opportunitySchema.index({ title: 1, company: 1, location: 1 });

module.exports = mongoose.model('Opportunity', opportunitySchema);