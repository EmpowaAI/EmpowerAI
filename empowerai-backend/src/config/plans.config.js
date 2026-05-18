const PLANS = {
  STARTER: {
    id: 'starter',
    name: 'Starter',
    description: 'Begin your career journey with essential tools for CV building and job readiness',
    priceMonthly: 29900,        // R299/month in kobo
    priceAnnual: 287040,        // R2870.40/year in kobo (20% off)
    currency: 'ZAR',
    trialDays: 14,
    features: {
      cvAnalyser: true,
      cvRevamp: true,
      interviewCoach: true,
      economicTwin: true,
      aiInsights: false,
      customBranding: false,
      prioritySupport: false,
      apiAccess: false,
    },
    paystackPlanCode: {
      monthly: process.env.PAYSTACK_PLAN_STARTER_MONTHLY,
      annual: process.env.PAYSTACK_PLAN_STARTER_ANNUAL,
    },
  },

  PROFESSIONAL: {
    id: 'professional',
    name: 'Professional',
    description: 'Unlock AI-powered career insights and higher usage limits for serious job seekers',
    priceMonthly: 79900,        // R799/month in kobo
    priceAnnual: 767040,        // R7670.40/year in kobo (20% off)
    currency: 'ZAR',
    trialDays: 14,
    features: {
      cvAnalyser: true,
      cvRevamp: true,
      interviewCoach: true,
      economicTwin: true,
      aiInsights: true,
      customBranding: true,
      prioritySupport: false,
      apiAccess: false,
    },
    paystackPlanCode: {
      monthly: process.env.PAYSTACK_PLAN_PROFESSIONAL_MONTHLY,
      annual: process.env.PAYSTACK_PLAN_PROFESSIONAL_ANNUAL,
    },
  },

  ENTERPRISE: {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'Unlimited access for organisations, NGOs, and career centres supporting South African youth at scale',
    priceMonthly: 199900,       // R1999/month in kobo
    priceAnnual: 1919040,       // R19190.40/year in kobo (20% off)
    currency: 'ZAR',
    trialDays: 30,
    features: {
      cvAnalyser: true,
      cvRevamp: true,
      interviewCoach: true,
      economicTwin: true,
      aiInsights: true,
      customBranding: true,
      prioritySupport: true,
      apiAccess: true,
    },
    paystackPlanCode: {
      monthly: process.env.PAYSTACK_PLAN_ENTERPRISE_MONTHLY,
      annual: process.env.PAYSTACK_PLAN_ENTERPRISE_ANNUAL,
    },
  },
};

const BILLING_CYCLES = {
  MONTHLY: 'monthly',
  ANNUAL: 'annual',
};

const SUBSCRIPTION_STATUS = {
  TRIAL: 'trial',
  ACTIVE: 'active',
  PAST_DUE: 'past_due',
  CANCELLED: 'cancelled',
  EXPIRED: 'expired',
  ATTENTION: 'attention',   // Paystack-specific: card needs updating
};

const getPlanPrice = (planId, cycle = BILLING_CYCLES.MONTHLY) => {
  const plan = PLANS[planId.toUpperCase()];
  if (!plan) throw new Error(`Unknown plan: ${planId}`);
  const kobo = cycle === BILLING_CYCLES.ANNUAL ? plan.priceAnnual : plan.priceMonthly;
  return (kobo / 100).toFixed(2);
};

const getPlanById = (planId) => {
  const plan = PLANS[planId?.toUpperCase()];
  if (!plan) throw new Error(`Unknown plan: ${planId}`);
  return plan;
};

const getPaystackPlanCode = (planId, billingCycle) => {
  const plan = getPlanById(planId);
  const code = plan.paystackPlanCode[billingCycle];
  if (!code) throw new Error(`Paystack plan code not configured for ${planId}/${billingCycle}`);
  return code;
};

module.exports = {
  PLANS,
  BILLING_CYCLES,
  SUBSCRIPTION_STATUS,
  getPlanPrice,
  getPlanById,
  getPaystackPlanCode,
};
