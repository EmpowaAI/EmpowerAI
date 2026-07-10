const leaderboardService = require('./leaderboard.Service');
const { sendSuccess } = require('../../utils/response');
const logger = require('../../utils/logger');

exports.getLeaderboard = async (req, res, next) => {
  try {
    const period = req.query.period || 'all-time';
    const limit = Math.min(parseInt(req.query.limit, 10) || 50, 100);

    const result = await leaderboardService.getLeaderboard({
      period,
      limit,
      currentUserId: req.user.id,
    });

    sendSuccess(res, result);
  } catch (error) {
    logger.error('Leaderboard: getLeaderboard failed', { error: error.message });
    next(error);
  }
};
