const { BILLING_CYCLES, SUBSCRIPTION_STATUS, getPlanById } = require('../../config/plans.config');

class SubscriptionService {
  constructor(db) {
    this.db = db;
  }

  // ─── START TRIAL ─────────────────────────────────────────────────────────────

  async startTrial(userId, planId = 'starter') {
    const existing = await this.db.subscriptions.findByUserId(userId);
    if (existing) throw new Error('User already has a subscription.');

    const plan = getPlanById(planId);
    const now = new Date();
    const trialEnd = new Date(now);
    trialEnd.setDate(trialEnd.getDate() + plan.trialDays);

    return this.db.subscriptions.create({
      userId,
      planId: plan.id,
      status: SUBSCRIPTION_STATUS.TRIAL,
      billingCycle: BILLING_CYCLES.MONTHLY,
      trialStartedAt: now,
      trialEndsAt: trialEnd,
      currentPeriodStart: now,
      currentPeriodEnd: trialEnd,
      cancelAtPeriodEnd: false,
    });
  }

  // ─── ACTIVATE AFTER PAYMENT ──────────────────────────────────────────────────

  async activate({ userId, planId, billingCycle, paystackSubscriptionCode,
    paystackCustomerCode, paystackEmailToken, paymentId, amountPaid }) {
    const plan = getPlanById(planId);
    const now = new Date();
    const periodEnd = this._calcPeriodEnd(now, billingCycle);
    const existing = await this.db.subscriptions.findByUserId(userId);

    const payload = {
      planId: plan.id, status: SUBSCRIPTION_STATUS.ACTIVE, billingCycle,
      paystackSubscriptionCode: paystackSubscriptionCode || existing?.paystackSubscriptionCode,
      paystackCustomerCode: paystackCustomerCode || existing?.paystackCustomerCode,
      paystackEmailToken: paystackEmailToken || existing?.paystackEmailToken,
      lastPaymentId: paymentId, lastPaymentAmount: amountPaid, lastPaymentAt: now,
      currentPeriodStart: now, currentPeriodEnd: periodEnd,
      cancelAtPeriodEnd: false, pendingPlanId: null, pendingBillingCycle: null,
    };

    if (existing) return this.db.subscriptions.update(existing._id, payload);
    return this.db.subscriptions.create({ userId, ...payload });
  }

  // ─── STORE PAYSTACK SUB DETAILS ───────────────────────────────────────────────

  async updatePaystackSubDetails({ paystackCustomerCode, paystackSubscriptionCode, paystackEmailToken, nextPaymentDate }) {
    const sub = await this.db.subscriptions.findByPaystackCustomerCode(paystackCustomerCode);
    if (!sub) { console.warn('[SubscriptionService] No sub found for customer:', paystackCustomerCode); return null; }
    return this.db.subscriptions.update(sub._id, { paystackSubscriptionCode, paystackEmailToken, nextPaymentDate });
  }

  // ─── RENEWAL ─────────────────────────────────────────────────────────────────

  async handleRenewalBySubscriptionCode({ subscriptionCode, paymentId, amountPaid }) {
    const sub = await this.db.subscriptions.findByPaystackSubscriptionCode(subscriptionCode);
    if (!sub) throw new Error(`No subscription found for Paystack code: ${subscriptionCode}`);

    const planId = sub.pendingPlanId || sub.planId;
    const billingCycle = sub.pendingBillingCycle || sub.billingCycle;
    const now = new Date();

    return this.db.subscriptions.update(sub._id, {
      planId, billingCycle, status: SUBSCRIPTION_STATUS.ACTIVE,
      currentPeriodStart: now, currentPeriodEnd: this._calcPeriodEnd(now, billingCycle),
      lastPaymentId: paymentId, lastPaymentAmount: amountPaid, lastPaymentAt: now,
      pendingPlanId: null, pendingBillingCycle: null,
    });
  }

  // ─── PAST DUE ────────────────────────────────────────────────────────────────

  async markPastDueBySubscriptionCode(subscriptionCode) {
    const sub = await this.db.subscriptions.findByPaystackSubscriptionCode(subscriptionCode);
    if (!sub) return null;
    return this.db.subscriptions.update(sub._id, { status: SUBSCRIPTION_STATUS.PAST_DUE });
  }

  // ─── CANCEL ──────────────────────────────────────────────────────────────────

  async cancel(userId, reason = '') {
    const sub = await this._requireSubscription(userId);
    if (sub.status === SUBSCRIPTION_STATUS.CANCELLED) throw new Error('Subscription is already cancelled.');
    const updated = await this.db.subscriptions.update(sub._id, {
      cancelAtPeriodEnd: true, cancellationReason: reason, cancelledAt: new Date(),
    });
    return { subscription: updated, message: `Subscription active until ${sub.currentPeriodEnd?.toDateString()} and will not renew.` };
  }

  async cancelImmediately(userId, reason = '') {
    const sub = await this._requireSubscription(userId);
    return this.db.subscriptions.update(sub._id, {
      status: SUBSCRIPTION_STATUS.CANCELLED, cancelAtPeriodEnd: false,
      cancellationReason: reason, cancelledAt: new Date(), currentPeriodEnd: new Date(),
    });
  }

  async cancelBySubscriptionCode(subscriptionCode, reason = '') {
    const sub = await this.db.subscriptions.findByPaystackSubscriptionCode(subscriptionCode);
    if (!sub) return null;
    return this.db.subscriptions.update(sub._id, {
      status: SUBSCRIPTION_STATUS.CANCELLED, cancelAtPeriodEnd: false,
      cancellationReason: reason, cancelledAt: new Date(),
    });
  }

  // ─── REACTIVATE ──────────────────────────────────────────────────────────────

  async reactivate(userId) {
    const sub = await this._requireSubscription(userId);
    if (!sub.cancelAtPeriodEnd) throw new Error('Subscription is not scheduled for cancellation.');
    if (sub.status === SUBSCRIPTION_STATUS.CANCELLED) throw new Error('Already cancelled. Start a new subscription.');
    return this.db.subscriptions.update(sub._id, { cancelAtPeriodEnd: false, cancellationReason: null, cancelledAt: null });
  }

  // ─── PLAN CHANGE ─────────────────────────────────────────────────────────────

  async changePlan(userId, newPlanId, billingCycle) {
    const sub = await this._requireSubscription(userId);
    const planRank = ['starter', 'professional', 'enterprise'];
    const isUpgrade = planRank.indexOf(newPlanId) > planRank.indexOf(sub.planId);

    if (newPlanId === sub.planId && billingCycle === sub.billingCycle) throw new Error('Already on this plan and cycle.');

    if (isUpgrade) return { action: 'checkout_required', planId: newPlanId, billingCycle };

    await this.db.subscriptions.update(sub._id, { pendingPlanId: newPlanId, pendingBillingCycle: billingCycle });
    const newPlan = getPlanById(newPlanId);
    return { action: 'scheduled', message: `Downgrade to ${newPlan.name} applies on ${sub.currentPeriodEnd?.toDateString()}` };
  }

  // ─── EXPIRE TRIALS (cron) ────────────────────────────────────────────────────

  async expireTrials() {
    const expired = await this.db.subscriptions.findExpiredTrials();
    return Promise.all(expired.map(sub =>
      this.db.subscriptions.update(sub._id, { status: SUBSCRIPTION_STATUS.EXPIRED })
    ));
  }

  // ─── GETTERS ─────────────────────────────────────────────────────────────────

  async getByUserId(userId) { return this.db.subscriptions.findByUserId(userId); }
  async getAll(filters = {}) { return this.db.subscriptions.findMany(filters); }

  // ─── HELPERS ─────────────────────────────────────────────────────────────────

  _calcPeriodEnd(from, billingCycle) {
    const end = new Date(from);
    billingCycle === BILLING_CYCLES.ANNUAL ? end.setFullYear(end.getFullYear() + 1) : end.setMonth(end.getMonth() + 1);
    return end;
  }

  async _requireSubscription(userId) {
    const sub = await this.db.subscriptions.findByUserId(userId);
    if (!sub) throw new Error(`No subscription found for user ${userId}`);
    return sub;
  }
}

module.exports = SubscriptionService;

