require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
require('dotenv').config();

const logger = require('./utils/logger');
const { apiLimiter, authLimiter, aiServiceLimiter } = require('./middleware/rateLimiter');
const { initAiQueue, getAiQueueHealth, getAiJobStatus } = require('./queues/aiQueue');

const app = express();
let serverInstance = null;
const AI_HEALTH_TIMEOUT_MS = Number(process.env.AI_HEALTH_TIMEOUT_MS || 15000);
const AI_HEALTH_STALE_MS = Number(process.env.AI_HEALTH_STALE_MS || 5 * 60 * 1000);
let lastAiHealth = {
  status: 'unknown',
  openaiStatus: 'unknown',
  checkedAt: null,
  error: null,
};

// Initialize background queue (no-op unless enabled via env)
initAiQueue();

// Compression middleware - reduces response size by ~70%
app.use(compression());

// Trust proxy - Required for Render and other hosting platforms
// Set to 1 so only the first proxy hop is trusted (prevents rate-limit bypass)
app.set('trust proxy', 1);

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  crossOriginEmbedderPolicy: false, // Allow embedding if needed
}));

// CORS configuration
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:5174',
  'https://empower-ai-gamma.vercel.app',
  'https://empowerai.onrender.com',
  'https://www.empowa.org',
  process.env.FRONTEND_URL,
  process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null,
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1 || origin?.includes('vercel.app') || process.env.NODE_ENV !== 'production') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Apply rate limiting to all API routes EXCEPT CV, Auth, and Twin routes
// CV routes: aiServiceLimiter (currently disabled)
// Auth routes: authLimiter
// Twin routes: No rate limiting (OpenAI will rate limit before we do)
app.use('/api', (req, res, next) => {
  // Skip general rate limiting for routes that have their own specific limiters or don't need it
  if (req.path.startsWith('/cv') || req.path.startsWith('/auth') || req.path.startsWith('/twin')) {
    return next();
  }
  return apiLimiter(req, res, next);
});

// Apply specific limiters to sensitive/expensive routes
app.use('/api/auth', authLimiter);
app.use('/api/cv', aiServiceLimiter);
app.use('/api/twin', aiServiceLimiter);

// Request logging middleware
app.use(require('./middleware/requestLogger'));

// Health check (before database connection check)
// Health check endpoint with AI service connectivity test
app.get('/api/health', async (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  const memoryUsage = process.memoryUsage();
  
  // If AI_SERVICE_URL is missing in production, it will fail to connect
  const aiServiceUrl = process.env.AI_SERVICE_URL;
  if (!aiServiceUrl && process.env.NODE_ENV === 'production') {
    logger.error('CRITICAL: AI_SERVICE_URL environment variable is missing in production!');
  }

  const aiServiceApiKey = process.env.AI_SERVICE_API_KEY;
  
  // Test AI service connectivity
  let aiServiceStatus = 'unknown';
  let aiServiceError = null;
  const now = Date.now();
  const cacheFresh = lastAiHealth.checkedAt && (now - lastAiHealth.checkedAt) < AI_HEALTH_STALE_MS;
  try {
    const axios = require('axios');
    const healthResponse = await axios.get(`${aiServiceUrl || 'http://localhost:8000'}/health`, {
      timeout: AI_HEALTH_TIMEOUT_MS,
      headers: aiServiceApiKey ? { 'X-API-KEY': aiServiceApiKey } : undefined,
    });
    aiServiceStatus = healthResponse.data?.status === 'healthy' ? 'connected' : 'unhealthy';
    if (healthResponse.data) {
      const openaiStatus = healthResponse.data.openai_status || 'unknown';
      aiServiceStatus += ` (openai: ${openaiStatus})`;
      lastAiHealth = {
        status: aiServiceStatus,
        openaiStatus,
        checkedAt: now,
        error: null,
      };
    }
  } catch (error) {
    const isTimeout = error.code === 'ECONNABORTED' || error.message?.includes('timeout');
    aiServiceStatus = isTimeout ? 'sleeping' : 'disconnected';
    aiServiceError = {
      code: error.code || 'UNKNOWN',
      message: error.message,
      url: `${aiServiceUrl}/health`
    };

    if (cacheFresh) {
      aiServiceStatus = `${lastAiHealth.status} (cached)`;
    } else {
      lastAiHealth = {
        status: aiServiceStatus,
        openaiStatus: 'unknown',
        checkedAt: now,
        error: aiServiceError,
      };
    }
  }
  
  res.status(200).json({ 
    status: 'OK', 
    message: 'EmpowerAI Backend is running',
    database: dbStatus,
    aiService: {
      status: aiServiceStatus,
      url: aiServiceUrl,
      error: aiServiceError
    },
    uptime: Math.floor(process.uptime()),
    memory: {
      used: Math.round(memoryUsage.heapUsed / 1024 / 1024) + 'MB',
      total: Math.round(memoryUsage.heapTotal / 1024 / 1024) + 'MB',
    },
    timestamp: new Date().toISOString(),
    version: process.env.APP_VERSION || '1.0.0',
  });
});

// Queue health (AI jobs)
app.get('/api/queue/health', async (req, res) => {
  const queueHealth = await getAiQueueHealth();
  res.status(200).json({
    status: 'OK',
    queue: queueHealth,
    timestamp: new Date().toISOString()
  });
});

// Queue job status
app.get('/api/queue/jobs/:jobId', async (req, res) => {
  const { jobId } = req.params;
  const status = await getAiJobStatus(jobId);
  res.status(200).json({
    status: 'OK',
    ...status,
    timestamp: new Date().toISOString()
  });
});

// Liveness probe (simple)
app.get('/api/health/live', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Alive',
    timestamp: new Date().toISOString()
  });
});

// Readiness probe (depends on DB)
app.get('/api/health/ready', async (req, res) => {
  const dbReady = mongoose.connection.readyState === 1;
  let schedulers = null;
  try {
    const { getSchedulerStatus: getRssStatus } = require('./services/rssScheduler');
    const { getSchedulerStatus: getJobStatus } = require('./services/jobAPIScheduler');
    schedulers = {
      rss: getRssStatus(),
      jobApi: getJobStatus()
    };
  } catch (e) {
    schedulers = { error: e.message };
  }

  if (!dbReady) {
    return res.status(503).json({
      status: 'NOT_READY',
      database: 'disconnected',
      schedulers,
      timestamp: new Date().toISOString()
    });
  }

  res.status(200).json({
    status: 'READY',
    database: 'connected',
    schedulers,
    timestamp: new Date().toISOString()
  });
});

// Database connection - MUST happen before routes
async function connectDatabase() {
  if (!process.env.MONGODB_URI) {
    console.error('MONGODB_URI not set - database operations will fail');
    return false;
  }

  try {
    // Disable buffering to prevent timeout errors
    mongoose.set('bufferCommands', false);

    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000, // Reduced from 30s
      socketTimeoutMS: 30000, // Reduced from 45s
      connectTimeoutMS: 10000, // Reduced from 30s
      maxPoolSize: 10,
      minPoolSize: 2, // Reduced from 5 for faster startup
      bufferCommands: false, // Disable buffering in connection options
      readPreference: 'primaryPreferred', // Faster reads
    });
    
    logger.info('MongoDB connected successfully', {
      host: mongoose.connection.host,
      database: mongoose.connection.name,
    });
    return true;
  } catch (err) {
    logger.error('MongoDB connection error', {
      error: err.message,
      stack: err.stack,
    });
    logger.warn('Server will continue but database operations will fail');
    return false;
  }
}

// --- MOVED ROUTES OUTSIDE TO PREVENT STARTUP 404s ---
// Standard middleware (JSON, CORS, logging) must be before routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/account', require('./routes/account')); 
app.use('/api/twin', require('./routes/twin'));
app.use('/api/opportunities', require('./routes/opportunities'));
app.use('/api/cv', require('./routes/cv'));
app.use('/api/interview', require('./routes/interview'));
app.use('/api/chat', require('./routes/chat'));
app.use('/api/rss', require('./routes/rss'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/user', require('./routes/user'));
app.use('/api/applications', require('./routes/applications'));

// Connect to database first, then set up routes
connectDatabase().then(async (connected) => {
  if (connected) {
    logger.info('Database ready, setting up routes');
    
    // Auto-seed opportunities if database is empty
    try {
      const Opportunity = require('./models/Opportunity');
      const opportunityCount = await Opportunity.countDocuments({ isActive: true });
      
      if (opportunityCount === 0) {
        logger.info('No opportunities found in database, auto-seeding...');
        const { seedOpportunities } = require('../scripts/seedOpportunities');
        const result = await seedOpportunities();
        logger.info(`Auto-seeded ${result?.new || 0} opportunities`);
      } else {
        logger.info(`Database already has ${opportunityCount} opportunities`);
      }
    } catch (error) {
      logger.warn('Failed to auto-seed opportunities:', error.message);
      // Don't block server startup if seeding fails
    }
    
    // Start RSS feed scheduler (only if database is connected)
    if (process.env.ENABLE_RSS_SCHEDULER !== 'false') {
      try {
        const { startRssScheduler } = require('./services/rssScheduler');
        startRssScheduler();
        logger.info('RSS feed scheduler initialized');
      } catch (error) {
        logger.warn('Failed to start RSS feed scheduler:', error.message);
      }
    }

    // Start Job API scheduler (Adzuna, Indeed) for real opportunities
    if (process.env.ENABLE_JOB_API_SCHEDULER !== 'false') {
      try {
        const { startJobAPIScheduler } = require('./services/jobAPIScheduler');
        startJobAPIScheduler();
        logger.info('Job API scheduler initialized');
      } catch (error) {
        logger.warn('Failed to start Job API scheduler:', error.message);
      }
    }
  } else {
    logger.warn('Database not connected, routes will return 503 errors');
  }

  // Root route handler (for Render health checks and general requests)
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

  // 404 handler for undefined routes (must be after all other routes)
  app.use((req, res, next) => {
    const { NotFoundError } = require('./utils/errors');
    const error = new NotFoundError(`Route ${req.originalUrl} not found`);
    next(error);
  });

  // Error handling middleware (must be last)
  app.use(require('./middleware/errorHandler'));

  // Start server
  const PORT = process.env.PORT || 5000;
  
  // Log AI service configuration on startup
  const aiServiceUrl = process.env.AI_SERVICE_URL || (process.env.NODE_ENV === 'production' ? 'MISSING_URL' : 'http://localhost:8000');
  const aiServiceApiKey = process.env.AI_SERVICE_API_KEY;
  logger.info('AI Service Configuration', {
    aiServiceUrl,
    baseURL: `${aiServiceUrl}/api`,
    cvAnalyzeEndpoint: `${aiServiceUrl}/api/cv/analyze`,
    healthCheckEndpoint: `${aiServiceUrl}/health`
  });
  
  // Test AI service connectivity on startup (non-blocking)
  if (process.env.NODE_ENV === 'production') {
    const axios = require('axios');
    
    // Test health endpoint (non-blocking, won't prevent server from starting)
    setTimeout(() => {
      axios.get(`${aiServiceUrl}/health`, {
        timeout: AI_HEALTH_TIMEOUT_MS,
        headers: aiServiceApiKey ? { 'X-API-KEY': aiServiceApiKey } : undefined,
      })
        .then(response => {
          logger.info('AI Service health check passed', {
            status: response.status,
            openaiStatus: response.data?.openai_status
          });
        })
        .catch(error => {
          const isTimeout = error.code === 'ECONNABORTED' || error.message?.includes('timeout');
          logger.warn('AI Service health check failed', {
            message: error.message,
            code: error.code,
            url: `${aiServiceUrl}/health`,
            note: isTimeout
              ? 'AI service likely sleeping (Render cold start)'
              : 'AI service health check failed'
          });
        });
    }, 2000); // Wait 2 seconds before checking to let the service start
  }
  
  serverInstance = app.listen(PORT, () => {
    logger.info('Server started successfully', {
      port: PORT,
      environment: process.env.NODE_ENV || 'development',
      healthCheck: `http://localhost:${PORT}/api/health`,
      aiServiceUrl,
      databaseStatus: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    });
  });
});

// Process-level error handling
process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled Promise Rejection', { reason });
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception', { error: error.message, stack: error.stack });
});

// Graceful shutdown
const shutdown = async (signal) => {
  try {
    logger.info('Shutdown signal received', { signal });
    const { stopRssScheduler } = require('./services/rssScheduler');
    const { stopJobAPIScheduler } = require('./services/jobAPIScheduler');
    stopRssScheduler();
    stopJobAPIScheduler();

    if (serverInstance) {
      await new Promise((resolve) => serverInstance.close(resolve));
    }

    await mongoose.connection.close(false);
    logger.info('Shutdown complete');
    process.exit(0);
  } catch (error) {
    logger.error('Shutdown error', { error: error.message });
    process.exit(1);
  }
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
