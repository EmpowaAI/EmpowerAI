const express = require('express');
const { getLeaderboard } = require('./leaderboard.Controller');
const { protect } = require('../../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/', getLeaderboard);

module.exports = router;
