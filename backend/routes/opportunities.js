const express = require('express');
const router = express.Router();

// Placeholder routes - to be implemented
router.get('/', async (req, res) => {
  // TODO: Get filtered opportunities
  res.json({ message: 'Get opportunities endpoint - to be implemented' });
});

router.get('/:id', async (req, res) => {
  // TODO: Get specific opportunity
  res.json({ message: 'Get opportunity endpoint - to be implemented' });
});

module.exports = router;

