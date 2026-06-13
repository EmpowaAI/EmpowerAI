

const express = require('express');
const router = express.Router();
const { requireActiveSubscription } = require('../../middleware/subscription.middleware');
const { PRODUCTS } = require('../../config/features.config');
const { UsageService } = require('../usage/usage.service');

router.get('/', requireActiveSubscription, async (req, res) => {
  try {
    const summary = await UsageService.getSummary(req.user.id, req.subscription.planId);
    res.json({ success: true, data: summary });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/:product', requireActiveSubscription, async (req, res) => {
  const { product } = req.params;

  if (!Object.values(PRODUCTS).includes(product)) {
    return res.status(400).json({
      success: false,
      message: `Unknown product. Valid values: ${Object.values(PRODUCTS).join(', ')}`,
    });
  }

  try {
    const usage = await UsageService.getProductUsage(req.user.id, req.subscription.planId, product);
    res.json({ success: true, data: usage });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
