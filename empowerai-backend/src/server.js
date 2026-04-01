require('dotenv').config();
const app = require('./app');
const logger = require('./utils/logger');
const { connectDB } = require('./config/db');
const { initSchedulers } = require('./services/scheduler');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();

    initSchedulers();

    app.listen(PORT, () => {
      logger.info(`🔥 Server running on port ${PORT}`);
    });

  } catch (err) {
    logger.error('Startup failed', err);
    process.exit(1);
  }
};

startServer();