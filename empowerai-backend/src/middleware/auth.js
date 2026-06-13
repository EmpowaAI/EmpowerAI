const supabase = require('../db/supabase');
const logger = require('../utils/logger');

const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      logger.warn('Auth: no token provided');
      return res.status(401).json({ status: 'error', message: 'Please log in to access this resource' });
    }

    const token = authHeader.split(' ')[1];

    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !authUser) {
      logger.warn('Auth: invalid or expired token');
      return res.status(401).json({ status: 'error', message: 'Your session has expired. Please log in again.' });
    }

    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('id, name, email, role, province, skills, avatar')
      .eq('id', authUser.id)
      .single();

    if (profileError || !profile) {
      logger.warn('Auth: user profile not found', { userId: authUser.id });
      return res.status(401).json({ status: 'error', message: 'User no longer exists' });
    }

    req.user = profile;
    next();
  } catch (error) {
    logger.error('Auth middleware error', { message: error.message });
    res.status(401).json({ status: 'error', message: 'Authentication failed. Please log in again.' });
  }
};

const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ status: 'error', message: 'Not authenticated' });
    }

    if (!roles.includes(req.user.role)) {
      logger.warn('Auth: insufficient role', {
        userId: req.user.id,
        userRole: req.user.role,
        requiredRoles: roles,
      });
      return res.status(403).json({
        status: 'error',
        message: 'You do not have permission to perform this action',
      });
    }

    next();
  };
};

module.exports = { protect, restrictTo };