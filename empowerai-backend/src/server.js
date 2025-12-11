const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
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
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use(require('./middleware/requestLogger'));

// Health check (before database connection check)
app.get('/api/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  res.status(200).json({ 
    status: 'OK', 
    message: 'EmpowerAI Backend is running',
    database: dbStatus,
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
    mongoose.set('bufferMaxEntries', 0);

    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 30000,
      maxPoolSize: 10,
      minPoolSize: 5,
    });
    
    console.log('✅ MongoDB connected successfully');
    return true;
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
    console.log('⚠️  Server will continue but database operations will fail');
    return false;
  }
}

// Connect to database first, then set up routes
connectDatabase().then((connected) => {
  if (connected) {
    console.log('✅ Database ready, setting up routes...');
  } else {
    console.log('⚠️  Database not connected, routes will return 503 errors');
  }

  // Routes (set up after database connection attempt)
  app.use('/api/auth', require('./routes/auth'));
  app.use('/api/twin', require('./routes/twin'));
  app.use('/api/opportunities', require('./routes/opportunities'));
  app.use('/api/cv', require('./routes/cv'));
  app.use('/api/interview', require('./routes/interview'));

  // Error handling middleware
  app.use(require('./middleware/errorHandler'));

  // Start server
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
    console.log(`🤖 AI Service URL: ${process.env.AI_SERVICE_URL || 'http://localhost:8000'}`);
    console.log(`📦 Database status: ${mongoose.connection.readyState === 1 ? '✅ Connected' : '❌ Disconnected'}`);
  });
});