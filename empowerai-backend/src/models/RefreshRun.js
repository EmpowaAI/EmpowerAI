const mongoose = require('mongoose');

const refreshRunSchema = new mongoose.Schema({
  startedAt: { type: Date, required: true },
  finishedAt: { type: Date, required: true },
  durationMs: { type: Number, required: true },
  triggeredBy: { type: String, default: 'admin' },
  backfill: {
    processed: { type: Number, default: 0 },
    updated: { type: Number, default: 0 }
  },
  fetch: {
    jobApis: {
      new: { type: Number, default: 0 },
      skipped: { type: Number, default: 0 },
      total: { type: Number, default: 0 }
    },
    rss: {
      new: { type: Number, default: 0 },
      skipped: { type: Number, default: 0 },
      errors: { type: Number, default: 0 }
    }
  },
  status: { type: String, enum: ['success', 'error'], default: 'success' },
  error: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('RefreshRun', refreshRunSchema);
