const express = require('express');
const { getAllOpportunities, getOpportunity } = require('../controllers/opportunityController');
const router = express.Router();

router.get('/', getAllOpportunities);
router.get('/:id', getOpportunity);

module.exports = router;