const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');

const corsOptions = require('./infrastructures/cors');
const helmetOptions = require('./infrastructures/helmet');
const { apiLimiter, authLimiter, aiServiceLimiter, isEnabled } = require('./middleware/rateLimiter');

const app = express();

// Compression — reduces response size by ~70%
app.use(compression());

// Trust first proxy hop only (required for Render; prevents rate-limit bypass)
app.set('trust proxy', 1);

// Security headers
app.use(helmet(helmetOptions));

// CORS
app.use(cors(corsOptions));

// Body parsing — 10MB limit to support CV data
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// --- Rate limiting ---
if (isEnabled(process.env.ENABLE_AUTH_RATE_LIMITER, true)) {
  app.use('/api/auth', authLimiter);
}

if (isEnabled(process.env.ENABLE_AI_RATE_LIMITER, true)) {
  app.use('/api/cv', aiServiceLimiter);
  app.use('/api/twin', aiServiceLimiter);
  app.use('/api/interview', aiServiceLimiter);
  app.use('/api/chat', aiServiceLimiter);
}

if (isEnabled(process.env.ENABLE_API_RATE_LIMITER, true)) {
  app.use('/api/account', apiLimiter);
  app.use('/api/opportunities', apiLimiter);
  app.use('/api/admin', apiLimiter);
  app.use('/api/user', apiLimiter);
  app.use('/api/applications', apiLimiter);
  app.use('/api/rss', apiLimiter);
}

// Request logging
app.use(require('./middleware/requestLogger'));

// --- Routes ---
app.use('/api/health', require('./routes/health'));
app.use('/api/auth', require('./modules/authentication/auth.Route'));
app.use('/api/account', require('./modules/userAccount/account.Route'));
app.use('/api/twin', require('./modules/twinBuilder/twinBuilder.Route'));
app.use('/api/opportunities', require('./modules/opportunities/opportunities.Route'));
app.use('/api/cv', require('./modules/cvAnalyser/cvAnalyser.Route'));
app.use('/api/interview', require('./modules/interview/interview.Route'));
app.use('/api/chat', require('./modules/twinChat/twinChat.Route'));
app.use('/api/rss', require('./routes/rss'));
app.use('/api/admin', require('./modules/admin/admin.Route'));
app.use('/api/user', require('./modules/user/user.Route'));
app.use('/api/applications', require('./modules/applications/applications.Route'));

// Root — Render health check + API discovery
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'EmpowerAI Backend API',
    version: process.env.APP_VERSION || '1.0.0',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      twin: '/api/twin',
      opportunities: '/api/opportunities',
      cv: '/api/cv',
      interview: '/api/interview',
      chat: '/api/chat',
    },
    timestamp: new Date().toISOString(),
  });
});

// 404 handler
app.use((req, res, next) => {
  const { NotFoundError } = require('./utils/errors');
  next(new NotFoundError(`Route ${req.originalUrl} not found`));
});

// Global error handler
app.use(require('./middleware/errorHandler'));

module.exports = app;
