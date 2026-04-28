const express = require('express');
const router = express.Router();

const adminController = require('./admin.Controller');
const { protect, restrictTo } = require('../../middleware/auth');



router.use(protect);
router.use(restrictTo('admin'));

router.get('/dashboard', adminController.getDashboard);


router.get('/users/stats', adminController.getUserStats);
router.get('/users', adminController.listUsers);
router.get('/users/:id', adminController.getUserById);
router.patch('/users/:id', adminController.updateUser);
router.patch('/users/:id/status', adminController.toggleUserStatus);
router.delete('/users/:id', adminController.deleteUser);


router.get('/opportunities/stats', adminController.getOpportunityStats);
router.get('/opportunities', adminController.listOpportunities);
router.get('/opportunities/:id', adminController.getOpportunityById);
router.patch('/opportunities/:id', adminController.updateOpportunity);
router.delete('/opportunities/:id', adminController.deleteOpportunity);
router.post('/opportunities/seed', adminController.seedOpportunities);
router.post('/opportunities/refresh', adminController.refreshOpportunities);


router.get('/taxonomy', adminController.getCareerTaxonomy);
router.put('/taxonomy', adminController.updateCareerTaxonomy);
router.get('/ai-usage/summary', adminController.getAiUsageSummary);
router.get('/ai-usage', adminController.listAiUsage);
router.get('/audit-logs', adminController.listAuditLogs);

module.exports = router;
