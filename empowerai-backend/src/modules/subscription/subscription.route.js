/**
 * EmpowerAI - Subscriptions Router
 *
 * POST  /api/subscriptions/trial            — start trial (called during user registration)
 * GET   /api/subscriptions/user/:userId     — get a user's subscription
 * GET   /api/subscriptions                  — list all (super admin)
 * POST  /api/subscriptions/checkout         — initiate Paystack checkout
 * PATCH /api/subscriptions/:userId/plan     — upgrade/downgrade plan
 * POST  /api/subscriptions/:userId/cancel   — cancel (at period end)
 * POST  /api/subscriptions/:userId/reactivate — undo cancellation
 */

const express = require('express');
const router = express.Router();
const { body, param, query, validationResult } = require('express-validator');
const { PLANS, BILLING_CYCLES } = require('../../config/plans.config');

// `protect` is the existing JWT auth middleware (see
// `src/middleware/auth.js`). It reads `Authorization: Bearer <token>`,
// verifies the JWT, loads the user from Mongo, and sets `req.user`.
// `restrictTo('admin')` is the existing role gate. It returns 403 if
// `req.user.role` is not in the list of allowed roles.
const { protect, restrictTo } = require('../../middleware/auth');

const validPlanIds = Object.keys(PLANS).map((k) => k.toLowerCase());
const validCycles = Object.values(BILLING_CYCLES);

// ─── VALIDATION ───────────────────────────────────────────────────────────────

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  next();
};

// ─── AUTH ────────────────────────────────────────────────────────────────────
//
// Background
// ----------
// The earlier `requireAuth` and `requireSuperAdmin` in this file called
// `next()` with no checks. The TODO comments said "plug it in here" and
// the real auth was not added. With those placeholders in place, every
// endpoint below could be reached without a token. An anonymous caller
// could change any user's plan, cancel any subscription, or list every
// subscription record.
//
// The middlewares below replace those placeholders with real checks.

// Layer 1: caller has a valid login.
//   - 401 if there is no `Authorization` header.
//   - 401 if the JWT is invalid or expired.
//   - On success, `req.user` is the User document loaded from Mongo.
const requireAuth = protect;

// Layer 2: caller is an admin.
//   - 401 if `req.user` is missing (no `protect` earlier in the chain).
//   - 403 if `req.user.role !== 'admin'`.
//
// The User model's role enum is `['user', 'admin']` (see
// `src/modules/user/user.Model.js`). There is no `super_admin` role,
// even though the earlier comment referenced one.
const requireAdmin = restrictTo('admin');

// Layer 3: for per-user routes (e.g. `/api/subscriptions/:userId/plan`),
// the caller's `req.user._id` must match the target userId on the
// request. Without this check, a logged-in user could cancel another
// user's subscription by changing the `:userId` in the URL.
//
// `userIdFrom` is a function that pulls the target userId off the
// request, from either `req.params.userId` or `req.body.userId`
// depending on the route. Admins skip the match check and can act on
// any userId.
const requireOwnerOrAdmin = (userIdFrom) => (req, res, next) => {
  const targetId = userIdFrom(req);
  const callerId = req.user?._id?.toString();
  if (req.user?.role === 'admin' || (callerId && callerId === String(targetId))) {
    return next();
  }
  return res.status(403).json({ success: false, message: 'Forbidden' });
};

// Two ready-made versions, one for each place the target userId can live.
const ownerFromParams = requireOwnerOrAdmin((req) => req.params.userId); // for /:userId/... routes
const ownerFromBody = requireOwnerOrAdmin((req) => req.body.userId);     // for POST /trial, POST /checkout

// ─── ROUTES ───────────────────────────────────────────────────────────────────

/**
 * POST /api/subscriptions/trial
 * Start a trial subscription for a newly registered EmpowerAI user.
 * Call this from your registration controller after user is created.
 *
 * Auth: must be logged in AND the `userId` in the body must match the
 *       caller's own userId (admins can pass any userId).
 */
router.post(
  '/trial',
  requireAuth,    // 401 if not logged in
  ownerFromBody,  // 403 if trying to start a trial for someone else's userId
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
 *
 * Auth: must be logged in AND `:userId` in the URL must match the
 *       caller's own userId (admins can read anyone's).
 */
router.get(
  '/user/:userId',
  requireAuth,      // 401 if not logged in
  ownerFromParams,  // 403 if trying to read someone else's subscription
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
 * List all subscriptions. Admin only.
 *
 * Auth: must be logged in AND have `role === 'admin'`. Regular users get 403.
 *
 * (The route's old "super admin only" comment referred to a role that
 * doesn't exist in `user.Model.js`. The real top role is `admin`.)
 */
router.get(
  '/',
  requireAuth,    // 401 if not logged in
  requireAdmin,   // 403 if logged in but not an admin
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
 * Returns { authorizationUrl } — redirect the user's browser to this URL.
 *
 * Auth: must be logged in AND the `userId` in the body must match the
 *       caller's own userId. Otherwise an attacker could pay-as-someone-else
 *       or set up a checkout under another user's email/billing record.
 */
router.post(
  '/checkout',
  requireAuth,    // 401 if not logged in
  ownerFromBody,  // 403 if userId in body isn't the caller's own
  [
    body('userId').notEmpty().withMessage('userId is required'),
    body('planId').isIn(validPlanIds).withMessage(`planId must be one of: ${validPlanIds.join(', ')}`),
    body('billingCycle').isIn(validCycles).withMessage(`billingCycle must be one of: ${validCycles.join(', ')}`),
  ],
  validate,
  async (req, res) => {
    try {
      const { userId, planId, billingCycle } = req.body;

      const user = await req.db.users.findById(userId);
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
 *
 * Auth: must be logged in AND `:userId` in the URL must match the caller's
 *       own userId (admins can change anyone's plan).
 */
router.patch(
  '/:userId/plan',
  requireAuth,      // 401 if not logged in
  ownerFromParams,  // 403 if trying to change someone else's plan
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
 *
 * Auth: must be logged in AND `:userId` in the URL must match the caller's
 *       own userId (admins can cancel anyone's). Without this, a logged-in
 *       user could cancel any other user's subscription by guessing their id.
 */
router.post(
  '/:userId/cancel',
  requireAuth,      // 401 if not logged in
  ownerFromParams,  // 403 if trying to cancel someone else's subscription
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
 *
 * Auth: must be logged in AND `:userId` in the URL must match the caller's
 *       own userId (admins can reactivate anyone's).
 */
router.post(
  '/:userId/reactivate',
  requireAuth,      // 401 if not logged in
  ownerFromParams,  // 403 if trying to reactivate someone else's subscription
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
