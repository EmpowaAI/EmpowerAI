const express = require('express');
const twinController = require('./twinBuilder.Controller');
const auth = require('../../middleware/auth');
const validateRequest = require('../../middleware/validate');

const {
  createTwinSchema,
  simulationSchema,
  chatMessageSchema,
} = require('../../utils/validators');

const router = express.Router();

// Apply auth globally
router.use(auth);

// -------------------- ROUTES --------------------

router.post(
  '/twin',
  validateRequest(createTwinSchema),
  twinController.createEconomicTwin
);

router.get(
  '/twin',
  twinController.getEconomicTwin
);


router.get('/my-twin', auth, twinController.getEconomicTwin)

router.post(
  '/twin/build-from-cv',
  twinController.buildTwinFromCv
);

router.post(
  '/chat/twin',
  validateRequest(chatMessageSchema),
  twinController.chatWithTwin
);

router.post(
  '/twin/simulate',
  validateRequest(simulationSchema),
  twinController.runSimulation
);

module.exports = router;