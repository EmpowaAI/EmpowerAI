'use strict';

const express    = require('express');
const router     = express.Router();
const controller = require('./twinBuilder.Controller');
const { protect } = require('../../middleware/auth');


router.use(protect);


router.post('/',              controller.createEconomicTwin);
router.post('/build-from-cv', controller.buildTwinFromCv);
router.post('/chat/init',    controller.initialiseTwinChat);
router.post('/chat/message', controller.chatWithTwin);
router.get('/',               controller.getEconomicTwin);
router.post('/simulate',      controller.runSimulation);

module.exports = router;
