/**
 * EduPulse AI - Plans Router
 * GET  /api/plans                 — list all plans (public)
 * GET  /api/plans/:planId         — get single plan (public)
 * GET  /api/plans/compare         — compare all plans (public)
 */

const express = require('express');
const router = express.Router();
const { PLANS, getPlanById, getPlanPrice, BILLING_CYCLES } = require('../../config/plans.config');

// ─── LIST ALL PLANS ──────────────────────────────────────────────────────────

router.get('/', (req, res) => {
  const { cycle = 'monthly' } = req.query;

  const plans = Object.values(PLANS).map((plan) => ({
    id: plan.id,
    name: plan.name,
    description: plan.description,
    price: {
      monthly: getPlanPrice(plan.id, BILLING_CYCLES.MONTHLY),
      annual: getPlanPrice(plan.id, BILLING_CYCLES.ANNUAL),
      currency: plan.currency,
      annualSavingPercent: 20,
    },
    trialDays: plan.trialDays,
    features: plan.features,
  }));

  res.json({ success: true, data: plans });
});

// ─── GET SINGLE PLAN ─────────────────────────────────────────────────────────

router.get('/:planId', (req, res) => {
  try {
    const plan = getPlanById(req.params.planId);
    res.json({
      success: true,
      data: {
        ...plan,
        price: {
          monthly: getPlanPrice(plan.id, BILLING_CYCLES.MONTHLY),
          annual: getPlanPrice(plan.id, BILLING_CYCLES.ANNUAL),
          currency: plan.currency,
        },
      },
    });
  } catch (err) {
    res.status(404).json({ success: false, message: err.message });
  }
});

module.exports = router;
