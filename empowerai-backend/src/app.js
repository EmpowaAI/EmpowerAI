require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');

const corsOptions = require('./infrastructures/cors');
const helmetOptions = require('./infrastructures/helmet');
const { apiLimiter, authLimiter, aiServiceLimiter, isEnabled } = require('./middleware/rateLimiter');

// ─── Payment & Subscription Services ─────────────────────────────────────────
const SubscriptionService = require('./modules/subscription/subscription.service');
const PaystackService = require('./modules/subscriptionPlan/paystack.service');

const subscriptionService = new SubscriptionService();
const paystackService = new PaystackService(subscriptionService);

const app = express();

// ─── Compression ──────────────────────────────────────────────────────────────
app.use(compression());

// Trust first proxy hop only (required for Render; prevents rate-limit bypass)
app.set('trust proxy', 1);

// ─── Security ─────────────────────────────────────────────────────────────────
app.use(helmet(helmetOptions));
app.use(cors(corsOptions));

// ─── Body Parsing ─────────────────────────────────────────────────────────────
// NOTE: express.json() must come BEFORE all routes EXCEPT /webhooks/paystack.
// The Paystack webhook route uses express.raw() per-route to preserve the raw
// body for HMAC signature verification.
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ─── Attach Payment Services to req ──────────────────────────────────────────
app.use((req, _res, next) => {
  req.subscriptionService = subscriptionService;
  req.paystackService = paystackService;
  next();
});

// ─── Rate Limiting ────────────────────────────────────────────────────────────
if (isEnabled(process.env.ENABLE_AUTH_RATE_LIMITER, true)) {
  app.use('/api/auth', authLimiter);
  // Password recovery endpoints get the same strict limiter - they can be
  // abused for email enumeration and mail-quota exhaustion.
  app.use('/api/account/forgot-password', authLimiter);
  app.use('/api/account/reset-password', authLimiter);
}

if (isEnabled(process.env.ENABLE_AI_RATE_LIMITER, true)) {
  app.use('/api/cv', aiServiceLimiter);
  app.use('/api/twin', aiServiceLimiter);
  app.use('/api/interview', aiServiceLimiter);
}

if (isEnabled(process.env.ENABLE_API_RATE_LIMITER, true)) {
  app.use('/api/account', apiLimiter);
  app.use('/api/opportunities', apiLimiter);
  app.use('/api/admin', apiLimiter);
  app.use('/api/user', apiLimiter);
  app.use('/api/applications', apiLimiter);
  app.use('/api/rss', apiLimiter);
  app.use('/api/plans', apiLimiter);
  app.use('/api/subscriptions', apiLimiter);
  app.use('/api/usage', apiLimiter);
  app.use('/api/leaderboard', apiLimiter);
  // Public endpoints that send mail / write rows - protect from spam
  app.use('/api/contact', apiLimiter);
  app.use('/api/waitlist', apiLimiter);
}

// ─── Request Logging ──────────────────────────────────────────────────────────
app.use(require('./middleware/requestLogger'));

// ─── Routes ───────────────────────────────────────────────────────────────────

// Auth & account
app.use('/api/auth',          require('./modules/auth/auth.Route'));
app.use('/api/account',       require('./modules/account/account.Route'));

// Existing routes
app.use('/api/health',        require('./routes/health'));
app.use('/api/twin',          require('./modules/twinBuilder/twinBuilder.Route'));
app.use('/api/opportunities', require('./modules/opportunities/opportunities.Route'));
app.use('/api/cv',            require('./modules/cvAnalyser/cvAnalyser.Route'));
app.use('/api/interview',     require('./modules/interview/interview.Route'));
app.use('/api/rss',           require('./routes/rss'));
app.use('/api/admin',         require('./modules/admin/admin.Route'));
app.use('/api/user',          require('./modules/user/user.Route'));
app.use('/api/applications',  require('./modules/applications/applications.Route'));
app.use('/api/contact',       require('./modules/contact/contact.Route'));
app.use('/api/waitlist',      require('./modules/waitlist/waitlist.Router'));
app.use('/api/leaderboard',   require('./modules/leaderboard/leaderboard.Route'));

// Subscription & billing routes
app.use('/api/plans',         require('./modules/subscriptionPlan/plans.route'));
app.use('/api/subscriptions', require('./modules/subscription/subscription.route'));
app.use('/api/usage',         require('./modules/usage/usage.route'));
app.use('/webhooks',          require('./routes/webhooks.route'));

// ─── Root - Render health check + API discovery ───────────────────────────────
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'EmpowerAI Backend API',
    version: process.env.APP_VERSION || '1.0.0',
    endpoints: {
      health:        '/api/health',
      user:          '/api/user',
      applications:  '/api/applications',
      twin:          '/api/twin',
      opportunities: '/api/opportunities',
      cv:            '/api/cv',
      interview:     '/api/interview',
      chat:          '/api/twin/chat',
      contact:       '/api/contact',
      admin:         '/api/admin',
      plans:         '/api/plans',
      subscriptions: '/api/subscriptions',
      usage:         '/api/usage',
    },
    timestamp: new Date().toISOString(),
  });
});

// ─── 404 Handler ──────────────────────────────────────────────────────────────
app.use((req, res, next) => {
  const { NotFoundError } = require('./utils/errors');
  next(new NotFoundError(`Route ${req.originalUrl} not found`));
});

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use(require('./middleware/errorHandler'));


module.exports = app;
