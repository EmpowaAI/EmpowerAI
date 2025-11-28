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
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Opportunity', opportunitySchema);