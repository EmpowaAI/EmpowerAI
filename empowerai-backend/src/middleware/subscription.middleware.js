

const Subscription = require('../modules/subscription/subscription.model');
const Usage = require('../modules/usage/usage.model');
const { getLimit, PLAN_LIMITS } = require('../config/features.config');
const { SUBSCRIPTION_STATUS } = require('../config/plans.config');

// ─── HELPER ───────────────────────────────────────────────────────────────────

const getCurrentPeriodStart = () => {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
};

// ─── MIDDLEWARE 1: requireActiveSubscription ──────────────────────────────────

const requireActiveSubscription = async (req, res, next) => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        code: 'UNAUTHENTICATED',
        message: 'Authentication required.',
      });
    }

    const subscription = await Subscription.findOne({ userId });

    if (!subscription) {
      return res.status(403).json({
        success: false,
        code: 'NO_SUBSCRIPTION',
        message: 'No subscription found. Please choose a plan to get started.',
        action: { label: 'View Plans', url: '/api/plans' },
      });
    }

    const activeStatuses = [SUBSCRIPTION_STATUS.ACTIVE, SUBSCRIPTION_STATUS.TRIAL];
    if (!activeStatuses.includes(subscription.status)) {
      const messages = {
        [SUBSCRIPTION_STATUS.EXPIRED]: 'Your trial has expired. Please subscribe to continue.',
        [SUBSCRIPTION_STATUS.CANCELLED]: 'Your subscription has been cancelled.',
        [SUBSCRIPTION_STATUS.PAST_DUE]: 'Your last payment failed. Please update your payment method.',
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
    const userId = req.user._id;
    const periodStart = getCurrentPeriodStart();
    const limit = getLimit(planId, product);

    // Unlimited
    if (limit === -1) {
      await Usage.increment(userId, product, periodStart);
      req.usage = { product, limit: 'unlimited', count: 'unlimited' };
      return next();
    }

    const currentCount = await Usage.getCount(userId, product, periodStart);

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

    const newCount = await Usage.increment(userId, product, periodStart);
    req.usage = { product, limit, count: newCount, remaining: limit - newCount };
    next();
  } catch (err) {
    console.error('[checkUsageLimit]', err.message);
    res.status(500).json({ success: false, message: 'Usage check failed.' });
  }
};

// ─── HELPERS ─────────────────────────────────────────────────────────────────

const _formatProduct = (product) =>
  product.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

const _capitalize = (str) =>
  str.charAt(0).toUpperCase() + str.slice(1);

module.exports = { requireActiveSubscription, checkUsageLimit, getCurrentPeriodStart };
