'use strict';

const express = require('express');
const supabase = require('../../db/supabase');
const logger = require('../../utils/logger');

const router = express.Router();

router.post('/', async (req, res, next) => {
  try {
    const email = (req.body?.email || '').trim().toLowerCase();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ status: 'error', message: 'Valid email required.' });
    }

    const { error } = await supabase.from('waitlist').insert({ email });

    if (error) {
      // PostgreSQL unique violation — already on waitlist
      if (error.code === '23505') {
        return res.status(200).json({ status: 'success', message: 'You are on the waitlist.' });
      }
      throw error;
    }

    logger.info('[Waitlist] New signup', { email });
    return res.status(201).json({ status: 'success', message: 'Added to waitlist.' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
