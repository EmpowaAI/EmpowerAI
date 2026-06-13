const supabase = require('../../db/supabase');
const { PRODUCTS, getLimit } = require('../../config/features.config');

const getCurrentPeriodStart = () => {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
};

const getNextMonthStart = () => {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));
};

async function getCount(userId, product, periodStart) {
  const { data, error } = await supabase
    .from('usages')
    .select('count')
    .eq('user_id', userId)
    .eq('product', product)
    .eq('period_start', periodStart.toISOString())
    .single();
  if (error && error.code !== 'PGRST116') throw error;
  return data?.count ?? 0;
}

async function increment(userId, product, periodStart) {
  const { data, error } = await supabase.rpc('increment_usage', {
    p_user_id: userId,
    p_product: product,
    p_period_start: periodStart.toISOString(),
  });
  if (error) throw error;
  return data;
}

async function getAllForUser(userId, periodStart) {
  const { data, error } = await supabase
    .from('usages')
    .select('product, count, last_used_at')
    .eq('user_id', userId)
    .eq('period_start', periodStart.toISOString());
  if (error) throw error;
  return data || [];
}

class UsageService {
  async getSummary(userId, planId) {
    const periodStart = getCurrentPeriodStart();
    const records = await getAllForUser(userId, periodStart);

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
        lastUsedAt: recordMap[product]?.last_used_at ?? null,
        resetsOn: getNextMonthStart(),
      };
    });

    return { planId, periodStart, resetsOn: getNextMonthStart(), products };
  }

  async getProductUsage(userId, planId, product) {
    const periodStart = getCurrentPeriodStart();
    const limit = getLimit(planId, product);
    const count = await getCount(userId, product, periodStart);
    return {
      product,
      used: count,
      limit: limit === -1 ? 'unlimited' : limit,
      remaining: limit === -1 ? 'unlimited' : Math.max(0, limit - count),
      resetsOn: getNextMonthStart(),
    };
  }
}

module.exports = { UsageService: new UsageService(), getCurrentPeriodStart, increment };
