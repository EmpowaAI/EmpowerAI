const supabase = require('../db/supabase');
const logger = require('../utils/logger');

async function connectDatabase() {
  try {
    const { error } = await supabase.from('users').select('id').limit(1);
    if (error) throw error;
    logger.info('Supabase connected successfully');
    return true;
  } catch (err) {
    logger.error('Supabase connection error', { error: err.message });
    logger.warn('Server will continue but database operations may fail');
    return false;
  }
}

module.exports = { connectDatabase };
