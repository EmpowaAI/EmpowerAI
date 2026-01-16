const express = require('express');
const { runSimulation, getSimulationHistory } = require('../controllers/simulationController');
const auth = require('../middleware/auth');
const router = express.Router();

router.use(auth);

router.post('/run', runSimulation);
router.get('/history', getSimulationHistory);

module.exports = router;