const supabase = require('../../db/supabase');
const { BILLING_CYCLES, SUBSCRIPTION_STATUS, getPlanById } = require('../../config/plans.config');

// ─── Field mapping: camelCase in/out, snake_case in DB ────────────────────────

function toRow(obj) {
  const map = {
    userId: 'user_id', planId: 'plan_id', billingCycle: 'billing_cycle',
    trialStartedAt: 'trial_started_at', trialEndsAt: 'trial_ends_at',
    currentPeriodStart: 'current_period_start', currentPeriodEnd: 'current_period_end',
    paystackCustomerCode: 'paystack_customer_code',
    paystackSubscriptionCode: 'paystack_subscription_code',
    paystackEmailToken: 'paystack_email_token',
    lastPaymentId: 'last_payment_id', lastPaymentAmount: 'last_payment_amount',
    lastPaymentAt: 'last_payment_at', nextPaymentDate: 'next_payment_date',
    cancelAtPeriodEnd: 'cancel_at_period_end', cancelledAt: 'cancelled_at',
    cancellationReason: 'cancellation_reason',
    pendingPlanId: 'pending_plan_id', pendingBillingCycle: 'pending_billing_cycle',
  };
  const row = {};
  for (const [k, v] of Object.entries(obj)) {
    row[map[k] || k] = v;
  }
  return row;
}

function fromRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    userId: row.user_id,
    planId: row.plan_id,
    billingCycle: row.billing_cycle,
    status: row.status,
    trialStartedAt: row.trial_started_at,
    trialEndsAt: row.trial_ends_at,
    currentPeriodStart: row.current_period_start,
    currentPeriodEnd: row.current_period_end,
    paystackCustomerCode: row.paystack_customer_code,
    paystackSubscriptionCode: row.paystack_subscription_code,
    paystackEmailToken: row.paystack_email_token,
    lastPaymentId: row.last_payment_id,
    lastPaymentAmount: row.last_payment_amount,
    lastPaymentAt: row.last_payment_at,
    nextPaymentDate: row.next_payment_date,
    cancelAtPeriodEnd: row.cancel_at_period_end,
    cancelledAt: row.cancelled_at,
    cancellationReason: row.cancellation_reason,
    pendingPlanId: row.pending_plan_id,
    pendingBillingCycle: row.pending_billing_cycle,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// ─── Repository helpers ───────────────────────────────────────────────────────

async function findByUserId(userId) {
  const { data, error } = await supabase
    .from('subscriptions').select('*').eq('user_id', userId).single();
  if (error && error.code !== 'PGRST116') throw error;
  return fromRow(data);
}

async function findByPaystackSubCode(code) {
  const { data, error } = await supabase
    .from('subscriptions').select('*').eq('paystack_subscription_code', code).single();
  if (error && error.code !== 'PGRST116') throw error;
  return fromRow(data);
}

async function findByPaystackCusCode(code) {
  const { data, error } = await supabase
    .from('subscriptions').select('*').eq('paystack_customer_code', code).single();
  if (error && error.code !== 'PGRST116') throw error;
  return fromRow(data);
}

async function createSub(data) {
  const { data: row, error } = await supabase
    .from('subscriptions').insert(toRow(data)).select('*').single();
  if (error) throw error;
  return fromRow(row);
}

async function updateSub(id, data) {
  const { data: row, error } = await supabase
    .from('subscriptions').update(toRow(data)).eq('id', id).select('*').single();
  if (error) throw error;
  return fromRow(row);
}

async function findExpiredTrials() {
  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('status', SUBSCRIPTION_STATUS.TRIAL)
    .lte('trial_ends_at', new Date().toISOString());
  if (error) throw error;
  return (data || []).map(fromRow);
}

async function findMany({ status, planId, page = 1, limit = 20 } = {}) {
  let q = supabase.from('subscriptions').select('*', { count: 'exact' });
  if (status) q = q.eq('status', status);
  if (planId) q = q.eq('plan_id', planId);
  q = q.order('created_at', { ascending: false })
       .range((page - 1) * limit, page * limit - 1);
  const { data, error, count } = await q;
  if (error) throw error;
  return {
    data: (data || []).map(fromRow),
    pagination: { page, limit, total: count, pages: Math.ceil(count / limit) },
  };
}

// ─── Service ──────────────────────────────────────────────────────────────────

function calcPeriodEnd(from, billingCycle) {
  const end = new Date(from);
  billingCycle === BILLING_CYCLES.ANNUAL
    ? end.setFullYear(end.getFullYear() + 1)
    : end.setMonth(end.getMonth() + 1);
  return end;
}

async function requireSubscription(userId) {
  const sub = await findByUserId(userId);
  if (!sub) throw new Error(`No subscription found for user ${userId}`);
  return sub;
}

class SubscriptionService {
  constructor() {}

  async startTrial(userId, planId = 'starter') {
    const existing = await findByUserId(userId);
    if (existing) throw new Error('User already has a subscription.');
    const plan = getPlanById(planId);
    const now = new Date();
    const trialEnd = new Date(now);
    trialEnd.setDate(trialEnd.getDate() + plan.trialDays);
    return createSub({
      userId, planId: plan.id, status: SUBSCRIPTION_STATUS.TRIAL,
      billingCycle: BILLING_CYCLES.MONTHLY,
      trialStartedAt: now, trialEndsAt: trialEnd,
      currentPeriodStart: now, currentPeriodEnd: trialEnd,
      cancelAtPeriodEnd: false,
    });
  }

  async activate({ userId, planId, billingCycle, paystackSubscriptionCode,
    paystackCustomerCode, paystackEmailToken, paymentId, amountPaid }) {
    const plan = getPlanById(planId);
    const now = new Date();
    const periodEnd = calcPeriodEnd(now, billingCycle);
    const existing = await findByUserId(userId);
    const payload = {
      planId: plan.id, status: SUBSCRIPTION_STATUS.ACTIVE, billingCycle,
      paystackSubscriptionCode: paystackSubscriptionCode || existing?.paystackSubscriptionCode,
      paystackCustomerCode: paystackCustomerCode || existing?.paystackCustomerCode,
      paystackEmailToken: paystackEmailToken || existing?.paystackEmailToken,
      lastPaymentId: paymentId, lastPaymentAmount: amountPaid, lastPaymentAt: now,
      currentPeriodStart: now, currentPeriodEnd: periodEnd,
      cancelAtPeriodEnd: false, pendingPlanId: null, pendingBillingCycle: null,
    };
    if (existing) return updateSub(existing.id, payload);
    return createSub({ userId, ...payload });
  }

  async updatePaystackSubDetails({ paystackCustomerCode, paystackSubscriptionCode, paystackEmailToken, nextPaymentDate }) {
    const sub = await findByPaystackCusCode(paystackCustomerCode);
    if (!sub) { console.warn('[SubscriptionService] No sub found for customer:', paystackCustomerCode); return null; }
    return updateSub(sub.id, { paystackSubscriptionCode, paystackEmailToken, nextPaymentDate });
  }

  async handleRenewalBySubscriptionCode({ subscriptionCode, paymentId, amountPaid }) {
    const sub = await findByPaystackSubCode(subscriptionCode);
    if (!sub) throw new Error(`No subscription found for Paystack code: ${subscriptionCode}`);
    const planId = sub.pendingPlanId || sub.planId;
    const billingCycle = sub.pendingBillingCycle || sub.billingCycle;
    const now = new Date();
    return updateSub(sub.id, {
      planId, billingCycle, status: SUBSCRIPTION_STATUS.ACTIVE,
      currentPeriodStart: now, currentPeriodEnd: calcPeriodEnd(now, billingCycle),
      lastPaymentId: paymentId, lastPaymentAmount: amountPaid, lastPaymentAt: now,
      pendingPlanId: null, pendingBillingCycle: null,
    });
  }

  async markPastDueBySubscriptionCode(subscriptionCode) {
    const sub = await findByPaystackSubCode(subscriptionCode);
    if (!sub) return null;
    return updateSub(sub.id, { status: SUBSCRIPTION_STATUS.PAST_DUE });
  }

  async cancel(userId, reason = '') {
    const sub = await requireSubscription(userId);
    if (sub.status === SUBSCRIPTION_STATUS.CANCELLED) throw new Error('Subscription is already cancelled.');
    const updated = await updateSub(sub.id, { cancelAtPeriodEnd: true, cancellationReason: reason, cancelledAt: new Date() });
    return { subscription: updated, message: `Subscription active until ${new Date(sub.currentPeriodEnd).toDateString()} and will not renew.` };
  }

  async cancelImmediately(userId, reason = '') {
    const sub = await requireSubscription(userId);
    return updateSub(sub.id, {
      status: SUBSCRIPTION_STATUS.CANCELLED, cancelAtPeriodEnd: false,
      cancellationReason: reason, cancelledAt: new Date(), currentPeriodEnd: new Date(),
    });
  }

  async cancelBySubscriptionCode(subscriptionCode, reason = '') {
    const sub = await findByPaystackSubCode(subscriptionCode);
    if (!sub) return null;
    return updateSub(sub.id, {
      status: SUBSCRIPTION_STATUS.CANCELLED, cancelAtPeriodEnd: false,
      cancellationReason: reason, cancelledAt: new Date(),
    });
  }

  async reactivate(userId) {
    const sub = await requireSubscription(userId);
    if (!sub.cancelAtPeriodEnd) throw new Error('Subscription is not scheduled for cancellation.');
    if (sub.status === SUBSCRIPTION_STATUS.CANCELLED) throw new Error('Already cancelled. Start a new subscription.');
    return updateSub(sub.id, { cancelAtPeriodEnd: false, cancellationReason: null, cancelledAt: null });
  }

  async changePlan(userId, newPlanId, billingCycle) {
    const sub = await requireSubscription(userId);
    const planRank = ['starter', 'professional', 'enterprise'];
    const isUpgrade = planRank.indexOf(newPlanId) > planRank.indexOf(sub.planId);
    if (newPlanId === sub.planId && billingCycle === sub.billingCycle) throw new Error('Already on this plan and cycle.');
    if (isUpgrade) return { action: 'checkout_required', planId: newPlanId, billingCycle };
    await updateSub(sub.id, { pendingPlanId: newPlanId, pendingBillingCycle: billingCycle });
    const newPlan = getPlanById(newPlanId);
    return { action: 'scheduled', message: `Downgrade to ${newPlan.name} applies on ${new Date(sub.currentPeriodEnd).toDateString()}` };
  }

  async expireTrials() {
    const expired = await findExpiredTrials();
    return Promise.all(expired.map(sub => updateSub(sub.id, { status: SUBSCRIPTION_STATUS.EXPIRED })));
  }

  async getByUserId(userId) { return findByUserId(userId); }
  async getAll(filters = {}) { return findMany(filters); }
}

module.exports = SubscriptionService;

