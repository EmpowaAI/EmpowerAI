const supabase = require('../db/supabase');
const logger = require('./logger');

const SEED_ADMINS = [
  'aiempowa@gmail.com',
];

const seedAdmins = async () => {
  for (const email of SEED_ADMINS) {
    try {
      const { data: user } = await supabase
        .from('users').select('id, role').eq('email', email).maybeSingle();
      if (user && user.role !== 'admin') {
        await supabase.from('users').update({ role: 'admin' }).eq('id', user.id);
        logger.info(`Promoted existing user to admin: ${email}`);
      } else if (!user) {
        logger.info(`Seed admin not yet registered: ${email} - will need manual promotion after signup`);
      }
    } catch (err) {
      logger.warn(`seedAdmins: failed for ${email}`, { message: err.message });
    }
  }
};

module.exports = seedAdmins;
