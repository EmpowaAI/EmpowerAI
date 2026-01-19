const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const logger = require('./utils/logger');
const { apiLimiter } = require('./middleware/rateLimiter');

const app = express();

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

// Apply rate limiting to all API routes
app.use('/api', apiLimiter);

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
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 30000,
      maxPoolSize: 10,
      minPoolSize: 5,
      bufferCommands: false, // Disable buffering in connection options
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
connectDatabase().then((connected) => {
  if (connected) {
    logger.info('Database ready, setting up routes');
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