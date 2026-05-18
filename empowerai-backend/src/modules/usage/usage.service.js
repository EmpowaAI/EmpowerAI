/**
 * EmpowerAI — Usage Service
 * Queries and manages product usage data per user per billing period.
 */

const Usage = require('./usage.model');
const { PRODUCTS, getLimit } = require('../../config/features.config');

const getCurrentPeriodStart = () => {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
};

const getNextMonthStart = () => {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));
};

class UsageService {
  async getSummary(userId, planId) {
    const periodStart = getCurrentPeriodStart();
    const records = await Usage.getAllForUser(userId, periodStart);

    const recordMap = {};
    for (const r of records) recordMap[r.product] = r;

    const products = Object.values(PRODUCTS).map((product) => {
      const limit = getLimit(planId, product);
      const count = recordMap[product]?.count ?? 0;

      return {
        product,
        label: product.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
        used: count,
        limit: limit === -1 ? 'unlimited' : limit,
        remaining: limit === -1 ? 'unlimited' : Math.max(0, limit - count),
        percentUsed: limit === -1 ? 0 : Math.min(100, Math.round((count / limit) * 100)),
        lastUsedAt: recordMap[product]?.lastUsedAt ?? null,
        resetsOn: getNextMonthStart(),
      };
    });

    return { planId, periodStart, resetsOn: getNextMonthStart(), products };
  }

  async getProductUsage(userId, planId, product) {
    const periodStart = getCurrentPeriodStart();
    const limit = getLimit(planId, product);
    const count = await Usage.getCount(userId, product, periodStart);

    return {
      product,
      used: count,
      limit: limit === -1 ? 'unlimited' : limit,
      remaining: limit === -1 ? 'unlimited' : Math.max(0, limit - count),
      resetsOn: getNextMonthStart(),
    };
  }
}

module.exports = { UsageService: new UsageService(), getCurrentPeriodStart };
