/**
 * EmpowerAI - Subscriptions Router
 *
 * POST  /api/subscriptions/trial            - start trial (called during user registration)
 * GET   /api/subscriptions/user/:userId     - get a user's subscription
 * GET   /api/subscriptions                  - list all (super admin)
 * POST  /api/subscriptions/checkout         - initiate Paystack checkout
 * PATCH /api/subscriptions/:userId/plan     - upgrade/downgrade plan
 * POST  /api/subscriptions/:userId/cancel   - cancel (at period end)
 * POST  /api/subscriptions/:userId/reactivate - undo cancellation
 */

const express = require('express');
const router = express.Router();
const { body, param, query, validationResult } = require('express-validator');
const { PLANS, BILLING_CYCLES } = require('../../config/plans.config');
const { protect, restrictTo } = require('../../middleware/auth');
const UserRepository = require('../user/User.Repository');

const validPlanIds = Object.keys(PLANS).map((k) => k.toLowerCase());
const validCycles = Object.values(BILLING_CYCLES);

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  next();
};

const requireAuth = protect;
const requireSuperAdmin = restrictTo('admin');

// Prevent IDOR: the target userId (param or body) must be the caller's own
// id, unless the caller is an admin. Without this, any logged-in user could
// read another user's billing data or cancel their subscription.
const requireSelfOrAdmin = (req, res, next) => {
  const targetUserId = req.params.userId || req.body.userId;
  if (req.user?.role === 'admin') return next();
  if (targetUserId && targetUserId === req.user?.id) return next();
  return res.status(403).json({
    success: false,
    message: 'You can only manage your own subscription.',
  });
};

// ─── ROUTES ───────────────────────────────────────────────────────────────────

/**
 * POST /api/subscriptions/trial
 * Start a trial subscription for a newly registered EmpowerAI user.
 * Call this from your registration controller after user is created.
 */
router.post(
  '/trial',
  requireAuth,
  requireSelfOrAdmin,
  [
    body('userId').notEmpty().withMessage('userId is required'),
    body('planId')
      .optional()
      .isIn(validPlanIds)
      .withMessage(`planId must be one of: ${validPlanIds.join(', ')}`),
  ],
  validate,
  async (req, res) => {
    try {
      const { userId, planId = 'starter' } = req.body;
      const subscription = await req.subscriptionService.startTrial(userId, planId);
      res.status(201).json({ success: true, data: subscription });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  }
);

/**
 * GET /api/subscriptions/user/:userId
 * Get the active subscription for a user.
 */
router.get(
  '/user/:userId',
  requireAuth,
  requireSelfOrAdmin,
  [param('userId').notEmpty()],
  validate,
  async (req, res) => {
    try {
      const subscription = await req.subscriptionService.getByUserId(req.params.userId);
      if (!subscription) {
        return res.status(404).json({ success: false, message: 'No subscription found.' });
      }
      res.json({ success: true, data: subscription });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
);

/**
 * GET /api/subscriptions
 * List all subscriptions. Super admin only.
 */
router.get(
  '/',
  requireAuth,
  requireSuperAdmin,
  [
    query('status').optional().isString(),
    query('planId').optional().isIn(validPlanIds),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
  ],
  validate,
  async (req, res) => {
    try {
      const { status, planId, page = 1, limit = 20 } = req.query;
      const result = await req.subscriptionService.getAll({ status, planId, page: +page, limit: +limit });
      res.json({ success: true, data: result });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
);

/**
 * POST /api/subscriptions/checkout
 * Initialise a Paystack transaction for a user subscribing to or upgrading a plan.
 * Returns { authorizationUrl } - redirect the user's browser to this URL.
 */
router.post(
  '/checkout',
  requireAuth,
  requireSelfOrAdmin,
  [
    body('userId').notEmpty().withMessage('userId is required'),
    body('planId').isIn(validPlanIds).withMessage(`planId must be one of: ${validPlanIds.join(', ')}`),
    body('billingCycle').isIn(validCycles).withMessage(`billingCycle must be one of: ${validCycles.join(', ')}`),
  ],
  validate,
  async (req, res) => {
    try {
      const { userId, planId, billingCycle } = req.body;

      const user = await UserRepository.findById(userId);
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found.' });
      }

      const checkout = await req.paystackService.initializeTransaction({ user, planId, billingCycle });

      res.json({
        success: true,
        data: {
          authorizationUrl: checkout.authorizationUrl,
          accessCode: checkout.accessCode,
          reference: checkout.reference,
        },
      });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  }
);

/**
 * PATCH /api/subscriptions/:userId/plan
 * Upgrade or downgrade a user's plan.
 */
router.patch(
  '/:userId/plan',
  requireAuth,
  requireSelfOrAdmin,
  [
    param('userId').notEmpty(),
    body('planId').isIn(validPlanIds).withMessage(`planId must be one of: ${validPlanIds.join(', ')}`),
    body('billingCycle').isIn(validCycles),
  ],
  validate,
  async (req, res) => {
    try {
      const { userId } = req.params;
      const { planId, billingCycle } = req.body;
      const result = await req.subscriptionService.changePlan(userId, planId, billingCycle);
      res.json({ success: true, data: result });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  }
);

/**
 * POST /api/subscriptions/:userId/cancel
 * Schedule a subscription cancellation at the end of the current billing period.
 */
router.post(
  '/:userId/cancel',
  requireAuth,
  requireSelfOrAdmin,
  [
    param('userId').notEmpty(),
    body('reason').optional().isString().isLength({ max: 500 }),
  ],
  validate,
  async (req, res) => {
    try {
      const { userId } = req.params;
      const { reason = '' } = req.body;
      const result = await req.subscriptionService.cancel(userId, reason);
      res.json({ success: true, data: result });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  }
);

/**
 * POST /api/subscriptions/:userId/reactivate
 * Undo a scheduled cancellation before the billing period ends.
 */
router.post(
  '/:userId/reactivate',
  requireAuth,
  requireSelfOrAdmin,
  [param('userId').notEmpty()],
  validate,
  async (req, res) => {
    try {
      const subscription = await req.subscriptionService.reactivate(req.params.userId);
      res.json({ success: true, data: subscription });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  }
);

module.exports = router;
