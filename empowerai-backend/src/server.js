const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/twin', require('./routes/twin'));
app.use('/api/simulation', require('./routes/simulation'));
app.use('/api/opportunities', require('./routes/opportunities'));

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'EmpowerAI Backend is running',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use(require('./middleware/errorHandler'));

// Database connection
<<<<<<< Updated upstream
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB connected successfully'))
  .catch(err => console.error('❌ MongoDB connection error:', err));
=======
if (process.env.MONGODB_URI) {
  mongoose.connect(process.env.MONGODB_URI, {
    tls: true,
    tlsInsecure: true   // <-- TLS override for macOS Node v24
  })
  .then(() => console.log('✅ MongoDB connected successfully'))
  .catch(err => {
    console.error('❌ MongoDB connection error:', err.message);
    console.log('⚠️  Server will continue without database (for testing)');
  });
} else {
  console.log('⚠️  MONGODB_URI not set - running without database');
}
>>>>>>> Stashed changes

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 EmpowerAI Server running on port ${PORT}`);
<<<<<<< Updated upstream
});
=======
  console.log(`📡 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🤖 AI Service URL: ${process.env.AI_SERVICE_URL || 'http://localhost:8000'}`);
});
>>>>>>> Stashed changes
