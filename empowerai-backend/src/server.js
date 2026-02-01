const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const logger = require('./utils/logger');
const { apiLimiter } = require('./middleware/rateLimiter');

const app = express();

// Trust proxy - Required for Render and other hosting platforms
// This allows Express to correctly identify the client IP from X-Forwarded-For header
app.set('trust proxy', true);

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

// Request logging middleware
app.use(require('./middleware/requestLogger'));

// Health check (before database connection check)
// Health check endpoint with AI service connectivity test
app.get('/api/health', async (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  const memoryUsage = process.memoryUsage();
  const aiServiceUrl = process.env.AI_SERVICE_URL || 'http://localhost:8000';
  
  // Test AI service connectivity
  let aiServiceStatus = 'unknown';
  let aiServiceError = null;
  try {
    const axios = require('axios');
    const healthResponse = await axios.get(`${aiServiceUrl}/health`, { timeout: 5000 });
    aiServiceStatus = healthResponse.data?.status === 'healthy' ? 'connected' : 'unhealthy';
    if (healthResponse.data) {
      aiServiceStatus += ` (openai: ${healthResponse.data.openai_status || 'unknown'})`;
    }
  } catch (error) {
    aiServiceStatus = 'disconnected';
    aiServiceError = {
      code: error.code || 'UNKNOWN',
      message: error.message,
      url: `${aiServiceUrl}/health`
    };
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
  } else {
    logger.warn('Database not connected, routes will return 503 errors');
  }

  // Routes (set up after database connection attempt)
  app.use('/api/auth', require('./routes/auth'));
  app.use('/api/twin', require('./routes/twin'));
  app.use('/api/opportunities', require('./routes/opportunities'));
  app.use('/api/cv', require('./routes/cv'));
  app.use('/api/interview', require('./routes/interview'));
  app.use('/api/chat', require('./routes/chat'));
  app.use('/api/rss', require('./routes/rss'));
  app.use('/api/admin', require('./routes/admin'));

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
  const aiServiceUrl = process.env.AI_SERVICE_URL || 'http://localhost:8000';
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
      axios.get(`${aiServiceUrl}/health`, { timeout: 5000 })
        .then(response => {
          logger.info('AI Service health check passed', {
            status: response.status,
            openaiStatus: response.data?.openai_status
          });
        })
        .catch(error => {
          logger.warn('AI Service health check failed', {
            message: error.message,
            code: error.code,
            url: `${aiServiceUrl}/health`,
            note: 'This may be normal if the service is starting up or sleeping'
          });
        });
    }, 2000); // Wait 2 seconds before checking to let the service start
  }
  
  app.listen(PORT, () => {
    logger.info('Server started successfully', {
      port: PORT,
      environment: process.env.NODE_ENV || 'development',
      healthCheck: `http://localhost:${PORT}/api/health`,
      aiServiceUrl,
      databaseStatus: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    });
  });
});
