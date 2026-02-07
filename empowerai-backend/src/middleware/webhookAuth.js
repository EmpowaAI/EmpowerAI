module.exports = (req, res, next) => {
  const webhookKey = process.env.OPPORTUNITY_REFRESH_WEBHOOK_KEY;
  if (!webhookKey) {
    return res.status(500).json({
      status: 'error',
      message: 'Webhook access is not configured'
    });
  }

  const provided = req.headers['x-webhook-key'];
  if (!provided || provided !== webhookKey) {
    return res.status(401).json({
      status: 'error',
      message: 'Unauthorized'
    });
  }

  req.refreshTriggeredBy = 'webhook';
  return next();
};
