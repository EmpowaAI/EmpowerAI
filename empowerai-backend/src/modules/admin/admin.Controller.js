const adminService = require('./admin.Service');
const { sendSuccess, sendError } = require('../../utils/response');
const logger = require('../../utils/logger');

// ─── DASHBOARD ───────────────────────────────────────────────────────────────

exports.getDashboard = async (req, res, next) => {
  try {
    const data = await adminService.getDashboard();
    sendSuccess(res, data);
  } catch (error) {
    logger.error('Admin: getDashboard failed', { error });
    next(error);
  }
};

// ─── USER MANAGEMENT ─────────────────────────────────────────────────────────

exports.listUsers = async (req, res, next) => {
  try {
    const result = await adminService.listUsers(req.query);
    sendSuccess(res, result);
  } catch (error) {
    logger.error('Admin: listUsers failed', { error });
    next(error);
  }
};

exports.getUserById = async (req, res, next) => {
  try {
    const user = await adminService.getUserById(req.params.id);
    sendSuccess(res, { user });
  } catch (error) {
    logger.error('Admin: getUserById failed', { userId: req.params.id, error });
    next(error);
  }
};

exports.updateUser = async (req, res, next) => {
  try {
    const user = await adminService.updateUser(req.params.id, req.body, req.user.id);
    sendSuccess(res, { user });
  } catch (error) {
    logger.error('Admin: updateUser failed', { userId: req.params.id, error });
    next(error);
  }
};

exports.toggleUserStatus = async (req, res, next) => {
  try {
    const { isActive } = req.body;
    if (typeof isActive !== 'boolean') {
      return sendError(res, 'isActive must be a boolean', 400);
    }
    const user = await adminService.toggleUserStatus(req.params.id, isActive, req.user.id);
    sendSuccess(res, { user });
  } catch (error) {
    logger.error('Admin: toggleUserStatus failed', { userId: req.params.id, error });
    next(error);
  }
};

exports.deleteUser = async (req, res, next) => {
  try {
    if (req.params.id === req.user.id) {
      return sendError(res, 'You cannot delete your own account', 400);
    }
    const result = await adminService.deleteUser(req.params.id, req.user.id);
    sendSuccess(res, result);
  } catch (error) {
    logger.error('Admin: deleteUser failed', { userId: req.params.id, error });
    next(error);
  }
};

exports.getUserStats = async (req, res, next) => {
  try {
    const stats = await adminService.getUserStats();
    sendSuccess(res, stats);
  } catch (error) {
    logger.error('Admin: getUserStats failed', { error });
    next(error);
  }
};

// ─── OPPORTUNITY MANAGEMENT ──────────────────────────────────────────────────

exports.listOpportunities = async (req, res, next) => {
  try {
    const result = await adminService.listOpportunities(req.query);
    sendSuccess(res, result);
  } catch (error) {
    logger.error('Admin: listOpportunities failed', { error });
    next(error);
  }
};

exports.getOpportunityById = async (req, res, next) => {
  try {
    const opportunity = await adminService.getOpportunityById(req.params.id);
    sendSuccess(res, { opportunity });
  } catch (error) {
    logger.error('Admin: getOpportunityById failed', { id: req.params.id, error });
    next(error);
  }
};

exports.updateOpportunity = async (req, res, next) => {
  try {
    const opportunity = await adminService.updateOpportunity(req.params.id, req.body, req.user.id);
    sendSuccess(res, { opportunity });
  } catch (error) {
    logger.error('Admin: updateOpportunity failed', { id: req.params.id, error });
    next(error);
  }
};

exports.deleteOpportunity = async (req, res, next) => {
  try {
    const result = await adminService.deleteOpportunity(req.params.id, req.user.id);
    sendSuccess(res, result);
  } catch (error) {
    logger.error('Admin: deleteOpportunity failed', { id: req.params.id, error });
    next(error);
  }
};

exports.getOpportunityStats = async (req, res, next) => {
  try {
    const stats = await adminService.getOpportunityStats();
    sendSuccess(res, stats);
  } catch (error) {
    logger.error('Admin: getOpportunityStats failed', { error });
    next(error);
  }
};

exports.seedOpportunities = async (req, res, next) => {
  try {
    logger.info('Admin: Seeding opportunities database');
    const result = await adminService.seedOpportunities();
    sendSuccess(res, { message: 'Opportunities seeded successfully', ...result });
  } catch (error) {
    logger.error('Admin: seedOpportunities failed', { error });
    next(error);
  }
};

exports.refreshOpportunities = async (req, res, next) => {
  const runBackfill = req.body?.backfill !== false;
  const runFetch = req.body?.fetch !== false;
  const asyncMode = req.body?.async === true || req.query?.async === 'true';
  const triggeredBy = req.refreshTriggeredBy || req.user?.email || 'admin';

  if (asyncMode) {
    sendSuccess(res, { message: 'Refresh queued', backfill: runBackfill, fetch: runFetch }, 202);
    setImmediate(() =>
      adminService
        .refreshOpportunities({ runBackfill, runFetch, triggeredBy })
        .catch((e) => logger.error('Admin: Async refresh failed', { error: e }))
    );
    return;
  }

  try {
    const result = await adminService.refreshOpportunities({ runBackfill, runFetch, triggeredBy });
    sendSuccess(res, result);
  } catch (error) {
    logger.error('Admin: refreshOpportunities failed', { error });
    next(error);
  }
};

// ─── TAXONOMY ────────────────────────────────────────────────────────────────

exports.getCareerTaxonomy = async (req, res, next) => {
  try {
    const taxonomy = await adminService.fetchCareerTaxonomy();
    sendSuccess(res, { taxonomy });
  } catch (error) {
    logger.error('Admin: getCareerTaxonomy failed', { error });
    next(error);
  }
};

exports.updateCareerTaxonomy = async (req, res, next) => {
  try {
    const saved = await adminService.updateCareerTaxonomy(req.body?.taxonomy, req.user.id);
    sendSuccess(res, { taxonomy: saved });
  } catch (error) {
    logger.error('Admin: updateCareerTaxonomy failed', { error });
    next(error);
  }
};

// ─── AI USAGE ────────────────────────────────────────────────────────────────

exports.listAiUsage = async (req, res, next) => {
  try {
    const result = await adminService.listAiUsage(req.query);
    sendSuccess(res, result);
  } catch (error) {
    logger.error('Admin: listAiUsage failed', { error });
    next(error);
  }
};

exports.getAiUsageSummary = async (req, res, next) => {
  try {
    const summary = await adminService.getAiUsageSummary();
    sendSuccess(res, summary);
  } catch (error) {
    logger.error('Admin: getAiUsageSummary failed', { error });
    next(error);
  }
};

// ─── AUDIT LOGS ──────────────────────────────────────────────────────────────

exports.listAuditLogs = async (req, res, next) => {
  try {
    const result = await adminService.listAuditLogs(req.query);
    sendSuccess(res, result);
  } catch (error) {
    logger.error('Admin: listAuditLogs failed', { error });
    next(error);
  }
};
