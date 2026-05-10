const User = require('../modules/user/user.Model');
const logger = require('./logger');

const SEED_ADMINS = [
  'aiempowa@gmail.com',
  
];

// Replace the emails above with the real 5 addresses

const seedAdmins = async () => {
  // If the DB isn't connected yet, mongoose will throw because bufferCommands is disabled.
  // Seeding is non-critical, so just skip in that case.
  const mongoose = require('mongoose');
  if (mongoose.connection.readyState !== 1) {
    logger.warn('Skipping seedAdmins because database is disconnected');
    return;
  }

  for (const email of SEED_ADMINS) {
    const existing = await User.findOne({ email });
    if (existing && existing.role !== 'admin') {
      await User.findByIdAndUpdate(existing._id, { role: 'admin' });
      logger.info(`Promoted existing user to admin: ${email}`);
    } else if (!existing) {
      logger.info(`Seed admin not yet registered: ${email} — will be promoted on signup`);
    }
  }
};

module.exports = seedAdmins;
