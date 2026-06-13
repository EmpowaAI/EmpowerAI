const supabase = require('../db/supabase');
const { getLimit } = require('../config/features.config');
const { SUBSCRIPTION_STATUS } = require('../config/plans.config');
const { getCurrentPeriodStart, increment } = require('../modules/usage/usage.service');

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
    cancelAtPeriodEnd: row.cancel_at_period_end,
    paystackCustomerCode: row.paystack_customer_code,
    paystackSubscriptionCode: row.paystack_subscription_code,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// ─── MIDDLEWARE 1: requireActiveSubscription ──────────────────────────────────

const requireActiveSubscription = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, code: 'UNAUTHENTICATED', message: 'Authentication required.' });
    }

    const { data: row } = await supabase
      .from('subscriptions').select('*').eq('user_id', userId).maybeSingle();

    if (!row) {
      return res.status(403).json({
        success: false,
        code: 'NO_SUBSCRIPTION',
        message: 'No subscription found. Please choose a plan to get started.',
        action: { label: 'View Plans', url: '/api/plans' },
      });
    }

    const subscription = fromRow(row);
    const activeStatuses = [SUBSCRIPTION_STATUS.ACTIVE, SUBSCRIPTION_STATUS.TRIAL];

    if (!activeStatuses.includes(subscription.status)) {
      const messages = {
        [SUBSCRIPTION_STATUS.EXPIRED]:   'Your trial has expired. Please subscribe to continue.',
        [SUBSCRIPTION_STATUS.CANCELLED]: 'Your subscription has been cancelled.',
        [SUBSCRIPTION_STATUS.PAST_DUE]:  'Your last payment failed. Please update your payment method.',
      };
      return res.status(403).json({
        success: false,
        code: 'SUBSCRIPTION_INACTIVE',
        status: subscription.status,
        message: messages[subscription.status] || 'Your subscription is not active.',
        action: { label: 'Manage Billing', url: '/billing' },
      });
    }

    req.subscription = subscription;
    next();
  } catch (err) {
    console.error('[requireActiveSubscription]', err.message);
    res.status(500).json({ success: false, message: 'Subscription check failed.' });
  }
};

// ─── MIDDLEWARE 2: checkUsageLimit ────────────────────────────────────────────

const checkUsageLimit = (product) => async (req, res, next) => {
  try {
    const { planId } = req.subscription;
    const userId = req.user.id;
    const periodStart = getCurrentPeriodStart();
    const limit = getLimit(planId, product);

    if (limit === -1) {
      await increment(userId, product, periodStart);
      req.usage = { product, limit: 'unlimited', count: 'unlimited' };
      return next();
    }

    const { data: usageRow } = await supabase
      .from('usages').select('count')
      .eq('user_id', userId).eq('product', product)
      .eq('period_start', periodStart.toISOString()).maybeSingle();
    const currentCount = usageRow?.count ?? 0;

    if (currentCount >= limit) {
      const planRank = ['starter', 'professional', 'enterprise'];
      const nextPlanId = planRank[planRank.indexOf(planId) + 1];
      return res.status(403).json({
        success: false,
        code: 'USAGE_LIMIT_REACHED',
        message: `You've reached your ${planId} plan limit of ${limit} uses for ${_formatProduct(product)} this month.`,
        usage: { product, used: currentCount, limit, remaining: 0 },
        upgrade: nextPlanId ? {
          message: `Upgrade to ${_capitalize(nextPlanId)} for more uses.`,
          planId: nextPlanId,
          action: { label: `Upgrade to ${_capitalize(nextPlanId)}`, url: '/billing/upgrade' },
        } : null,
      });
    }

    const newCount = await increment(userId, product, periodStart);
    req.usage = { product, limit, count: newCount, remaining: limit - newCount };
    next();
  } catch (err) {
    console.error('[checkUsageLimit]', err.message);
    res.status(500).json({ success: false, message: 'Usage check failed.' });
  }
};

const _formatProduct = (product) => product.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
const _capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

module.exports = { requireActiveSubscription, checkUsageLimit, getCurrentPeriodStart };
