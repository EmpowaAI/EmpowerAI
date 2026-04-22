

const express = require('express');
const router = express.Router();
const adminController = require('./admin.Controller');
const adminAuth = require('../../middleware/adminAuth');
const webhookAuth = require('../../middleware/webhookAuth');

router.post('/refresh-opportunities/webhook', webhookAuth, adminController.refreshOpportunities);
router.use(adminAuth);
router.post('/seed-opportunities', adminController.seedOpportunities);
router.get('/stats', adminController.getStats);
router.get('/career-taxonomy', adminController.getCareerTaxonomy);
router.put('/career-taxonomy', adminController.updateCareerTaxonomy);
router.post('/refresh-opportunities', adminController.refreshOpportunities);

module.exports = router;
