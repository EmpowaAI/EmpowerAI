const express = require('express');
const { createEconomicTwin, getEconomicTwin, runSimulation, updateEconomicTwin } = require('../controllers/twinController');
const auth = require('../middleware/auth');
const router = express.Router();

// All routes protected by authentication
router.use(auth);

router.post('/create', createEconomicTwin);
router.put('/update', updateEconomicTwin); // New update endpoint
router.get('/my-twin', getEconomicTwin);
router.post('/simulate', runSimulation);

module.exports = router;