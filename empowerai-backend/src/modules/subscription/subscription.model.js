const mongoose = require('mongoose');
const { SUBSCRIPTION_STATUS, BILLING_CYCLES } = require('../../config/plans.config');

const subscriptionSchema = new mongoose.Schema(
  {
    userId: {                              // ✅ was schoolId
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',                         // ✅ was 'School'
      required: true,
      unique: true,
      index: true,
    },

    // ── Plan ───────────────────────────────────────────────────────────────────
    planId: {
      type: String,
      enum: ['starter', 'professional', 'enterprise'],
      required: true,
    },
    billingCycle: {
      type: String,
      enum: Object.values(BILLING_CYCLES),
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(SUBSCRIPTION_STATUS),
      default: SUBSCRIPTION_STATUS.TRIAL,
      index: true,
    },

    // ── Trial ──────────────────────────────────────────────────────────────────
    trialStartedAt: { type: Date },
    trialEndsAt:    { type: Date, index: true },

    // ── Billing Period ─────────────────────────────────────────────────────────
    currentPeriodStart: { type: Date },
    currentPeriodEnd:   { type: Date, index: true },

    // ── Paystack References ────────────────────────────────────────────────────
    paystackCustomerCode:     { type: String, index: true },  // CUS_xxx
    paystackSubscriptionCode: { type: String, index: true },  // SUB_xxx
    paystackEmailToken:       { type: String },

    // ── Payment History ────────────────────────────────────────────────────────
    lastPaymentId:     { type: String },
    lastPaymentAmount: { type: Number },   // in kobo
    lastPaymentAt:     { type: Date },
    nextPaymentDate:   { type: Date },

    // ── Cancellation ───────────────────────────────────────────────────────────
    cancelAtPeriodEnd:    { type: Boolean, default: false },
    cancelledAt:          { type: Date },
    cancellationReason:   { type: String, maxlength: 500 },

    // ── Pending Plan Change (scheduled downgrade) ──────────────────────────────
    pendingPlanId:       { type: String },
    pendingBillingCycle: { type: String, enum: [...Object.values(BILLING_CYCLES), null] },
  },
  {
    timestamps: true,
    toJSON:   { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ─── VIRTUALS ─────────────────────────────────────────────────────────────────

subscriptionSchema.virtual('isTrialActive').get(function () {
  return this.status === SUBSCRIPTION_STATUS.TRIAL && this.trialEndsAt > new Date();
});

subscriptionSchema.virtual('isActive').get(function () {
  return (
    this.status === SUBSCRIPTION_STATUS.ACTIVE ||
    this.status === SUBSCRIPTION_STATUS.TRIAL
  );
});

subscriptionSchema.virtual('daysUntilTrialEnd').get(function () {
  if (!this.trialEndsAt) return null;
  const diff = this.trialEndsAt - new Date();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
});

// ─── INDEXES ──────────────────────────────────────────────────────────────────

subscriptionSchema.index({ status: 1, trialEndsAt: 1 });
subscriptionSchema.index({ status: 1, currentPeriodEnd: 1 });

// ─── STATICS ─────────────────────────────────────────────────────────────────

subscriptionSchema.statics.findByUserId = function (userId) {
  return this.findOne({ userId });              // ✅ was { Id: userId }
};

subscriptionSchema.statics.findByPaystackSubscriptionCode = function (code) {
  return this.findOne({ paystackSubscriptionCode: code });
};

subscriptionSchema.statics.findByPaystackCustomerCode = function (code) {
  return this.findOne({ paystackCustomerCode: code });
};

subscriptionSchema.statics.findExpiredTrials = function () {
  return this.find({
    status: SUBSCRIPTION_STATUS.TRIAL,
    trialEndsAt: { $lte: new Date() },
  });
};

const Subscription = mongoose.model('Subscription', subscriptionSchema);

module.exports = Subscription;
