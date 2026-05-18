'use strict';

const express = require('express');
const Waitlist = require('./Waitlist.Model');
const logger = require('../../utils/logger');

const router = express.Router();

router.post('/', async (req, res, next) => {
  try {
    const email = (req.body?.email || '').trim().toLowerCase();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ status: 'error', message: 'Valid email required.' });
    }

    try {
      await Waitlist.create({ email });
      logger.info('[Waitlist] New signup', { email });
    } catch (err) {
      if (err.code === 11000) {
        // Already on waitlist — treat as success so we don't leak existence
        return res.status(200).json({ status: 'success', message: 'You are on the waitlist.' });
      }
      throw err;
    }

    return res.status(201).json({ status: 'success', message: 'Added to waitlist.' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
