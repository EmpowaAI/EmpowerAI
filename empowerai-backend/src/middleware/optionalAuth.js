const supabase = require('../db/supabase');

/**
 * Optional auth middleware.
 * If a valid Bearer token is provided, attaches req.user (Supabase profile).
 * If no token is provided, continues as unauthenticated.
 * If token is provided but invalid/expired, returns 401.
 */
module.exports = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.split(' ')[1];
    const { data: { user: authUser }, error } = await supabase.auth.getUser(token);

    if (error || !authUser) {
      return res.status(401).json({ status: 'error', message: 'Invalid or expired token. Please log in again.' });
    }

    const { data: profile } = await supabase
      .from('users').select('id, name, email, role, province, skills, avatar')
      .eq('id', authUser.id).single();

    if (profile) req.user = profile;
    next();
  } catch (error) {
    console.error('Optional auth middleware error:', error.message);
    res.status(401).json({ status: 'error', message: 'Authentication failed. Please log in again.' });
  }
};
