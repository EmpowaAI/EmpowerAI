require('dotenv').config();
const express = require('express');
const compression = require('compression');

const cors = require('./config/cors');
const helmet = require('./config/helmet');

const {
  apiLimiter,
  authLimiter,
  aiServiceLimiter
} = require('./middleware/rateLimiter');
const requestLogger = require('./middleware/requestLogger');
const errorHandler = require('./middleware/errorHandler');
const routes = require('./routes');

const app = express();

// Core middleware
app.use(compression());
app.set('trust proxy', 1);

app.use(helmet);
app.use(cors);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Logger
app.use(requestLogger);

// Rate limiting
app.use(apiLimiter);
app.use('/api/auth', authLimiter);
app.use('/api/twin', aiServiceLimiter);

// Routes
app.use('/api', routes);

// Root
app.get('/', (req, res) => {
  res.json({ status: 'OK', message: 'EmpowerAI API' });
});

// Error handler (LAST)
app.use(errorHandler);

module.exports = app;