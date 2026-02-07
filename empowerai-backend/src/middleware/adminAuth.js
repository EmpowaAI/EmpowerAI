module.exports = (req, res, next) => {
  const adminKey = process.env.ADMIN_API_KEY;
  if (!adminKey) {
    return res.status(500).json({
      status: 'error',
      message: 'Admin access is not configured'
    });
  }

  const provided = req.headers['x-admin-key'];
  if (!provided || provided !== adminKey) {
    return res.status(401).json({
      status: 'error',
      message: 'Unauthorized'
    });
  }

  req.refreshTriggeredBy = 'admin';
  return next();
};
