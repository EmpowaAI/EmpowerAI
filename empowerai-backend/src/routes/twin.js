const express = require('express');
const { createEconomicTwin, getEconomicTwin, runSimulation } = require('../controllers/twinController');
const auth = require('../middleware/auth');
const validateRequest = require('../middleware/validate');
const { createTwinSchema, simulationSchema } = require('../utils/validators');
const router = express.Router();

// All routes protected by authentication
router.use(auth);

router.post('/create', validateRequest(createTwinSchema), createEconomicTwin);
router.get('/my-twin', getEconomicTwin);
router.post('/simulate', validateRequest(simulationSchema), runSimulation);

module.exports = router;
