
const mongoose = require('mongoose');

const usageSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    product: {
      type: String,
      required: true,
      index: true,
    },
    // Period: first day of the billing month (used to scope resets)
    periodStart: {
      type: Date,
      required: true,
    },
    count: {
      type: Number,
      default: 0,
      min: 0,
    },
    // Last time this product was used — useful for analytics
    lastUsedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

// Unique constraint: one record per user + product + period
usageSchema.index({ userId: 1, product: 1, periodStart: 1 }, { unique: true });

// ─── STATICS ──────────────────────────────────────────────────────────────────

/**
 * Get current usage count for a user + product in the active period.
 */
usageSchema.statics.getCount = async function (userId, product, periodStart) {
  const record = await this.findOne({ userId, product, periodStart });
  return record?.count ?? 0;
};

/**
 * Increment usage by 1 and return the new count.
 * Uses findOneAndUpdate with upsert so it's safe to call concurrently.
 */
usageSchema.statics.increment = async function (userId, product, periodStart) {
  const record = await this.findOneAndUpdate(
    { userId, product, periodStart },
    {
      $inc: { count: 1 },
      $set: { lastUsedAt: new Date() },
      $setOnInsert: { userId, product, periodStart },
    },
    { upsert: true, new: true }
  );
  return record.count;
};

/**
 * Get all usage records for a user in the current period (for dashboard).
 */
usageSchema.statics.getAllForUser = async function (userId, periodStart) {
  return this.find({ userId, periodStart }).lean();
};

const Usage = mongoose.model('Usage', usageSchema);

module.exports = Usage;
