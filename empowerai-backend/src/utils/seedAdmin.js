const User = require('../modules/user/user.Model');
const logger = require('./logger');

const SEED_ADMINS = [
  'admin1@techbridlefoundation.org',
  'admin2@techbridlefoundation.org',
  'admin3@techbridlefoundation.org',
  'admin4@techbridlefoundation.org',
  'admin5@techbridlefoundation.org',
];

// Replace the emails above with the real 5 addresses

const seedAdmins = async () => {
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