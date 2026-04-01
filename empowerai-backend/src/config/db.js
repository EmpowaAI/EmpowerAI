const mongoose = require('mongoose');
const logger = require('../utils/logger');

const connectDB = async () => {
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI missing');
  }

  await mongoose.connect(process.env.MONGODB_URI);
  logger.info('MongoDB connected');
};

module.exports = { connectDB };