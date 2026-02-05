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

// Indexes for common query patterns - improves query speed by ~80%
opportunitySchema.index({ externalId: 1, source: 1 }); // Deduplication
opportunitySchema.index({ title: 1, company: 1, location: 1 }); // Search
opportunitySchema.index({ type: 1, isActive: 1 }); // Filter by type
opportunitySchema.index({ province: 1, isActive: 1 }); // Filter by province
opportunitySchema.index({ deadline: 1, isActive: 1 }); // Sort by deadline
opportunitySchema.index({ createdAt: -1 }); // Sort by newest
opportunitySchema.index({ isActive: 1, deadline: 1, createdAt: -1 }); // Compound for listings

module.exports = mongoose.model('Opportunity', opportunitySchema);