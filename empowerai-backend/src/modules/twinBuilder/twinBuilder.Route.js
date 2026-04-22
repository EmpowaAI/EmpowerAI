const express = require('express');
const twinController = require('./twinBuilder.Controller');
const { protect, restrictTo } = require('../../middleware/auth');
const validateRequest = require('../../middleware/validate');

const {
  createTwinSchema,
  simulationSchema,
  chatMessageSchema,
} = require('../../utils/validators');

const router = express.Router();

router.use(protect);

router.post(
  '/twin',
  protect,
  validateRequest(createTwinSchema),
  twinController.createEconomicTwin
);


router.get('/my-twin', protect, twinController.getEconomicTwin);

router.post(
  '/twin/build-from-cv',
  protect,
  twinController.buildTwinFromCv
);

router.post(
  '/chat/twin',
  protect,
  validateRequest(chatMessageSchema),
  twinController.chatWithTwin
);

router.post(
  '/twin/simulate',
  protect,
  validateRequest(simulationSchema),
  twinController.runSimulation
);

module.exports = router;