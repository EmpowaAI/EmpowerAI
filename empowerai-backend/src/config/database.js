const mongoose = require('mongoose');
const logger = require('../utils/logger');

async function connectDatabase() {
  if (!process.env.MONGODB_URI) {
    logger.error('MONGODB_URI not set - database operations will fail');
    return false;
  }

  try {
    mongoose.set('bufferCommands', false);

    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 30000,
      connectTimeoutMS: 10000,
      maxPoolSize: 10,
      minPoolSize: 2,
      bufferCommands: false,
      readPreference: 'primaryPreferred',
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

module.exports = { connectDatabase };
