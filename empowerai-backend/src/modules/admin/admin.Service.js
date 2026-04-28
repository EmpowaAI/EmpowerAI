const adminRepository = require('./admin.Repository');
const logger = require('../../utils/logger');
const { extractSkillsEnhanced } = require('../../utils/skillExtractors');
const { fetchAndSaveJobs } = require('../../services/jobAPIService');
const { fetchAllFeeds } = require('../../services/rssFeedService');
const { getCareerTaxonomy, setCareerTaxonomy } = require('../../services/taxonomyService');
const Opportunity = require('../opportunities/Opportunity.Model');
const RefreshRun = require('../../models/RefreshRun');

// ─── USER MANAGEMENT ─────────────────────────────────────────────────────────

exports.listUsers = async (query) => {
  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit) || 20));
  const search = query.search?.trim() || null;
  const role = query.role || null;
  const isActive =
    query.isActive === 'true' ? true : query.isActive === 'false' ? false : undefined;

  const { users, total } = await adminRepository.findAllUsers({ page, limit, search, role, isActive });

  return {
    users,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

exports.getUserById = async (id) => {
  const user = await adminRepository.findUserById(id);
  if (!user) throw Object.assign(new Error('User not found'), { status: 404 });
  return user;
};

exports.updateUser = async (id, updates, actorId) => {
  const allowed = ['name', 'role', 'isActive', 'email'];
  const safeUpdates = Object.fromEntries(
    Object.entries(updates).filter(([k]) => allowed.includes(k))
  );

  if (Object.keys(safeUpdates).length === 0) {
    throw Object.assign(new Error('No valid fields to update'), { status: 400 });
  }

  const user = await adminRepository.updateUser(id, safeUpdates);
  if (!user) throw Object.assign(new Error('User not found'), { status: 404 });

  await adminRepository.createAuditLog({
    actorId,
    action: 'USER_UPDATED',
    targetModel: 'User',
    targetId: id,
    changes: safeUpdates,
  });

  logger.info('Admin: User updated', { targetUserId: id, actorId, changes: safeUpdates });
  return user;
};

exports.toggleUserStatus = async (id, isActive, actorId) => {
  const user = await adminRepository.toggleUserStatus(id, isActive);
  if (!user) throw Object.assign(new Error('User not found'), { status: 404 });

  await adminRepository.createAuditLog({
    actorId,
    action: isActive ? 'USER_ACTIVATED' : 'USER_DEACTIVATED',
    targetModel: 'User',
    targetId: id,
  });

  logger.info(`Admin: User ${isActive ? 'activated' : 'deactivated'}`, { targetUserId: id, actorId });
  return user;
};

exports.deleteUser = async (id, actorId) => {
  const user = await adminRepository.deleteUser(id);
  if (!user) throw Object.assign(new Error('User not found'), { status: 404 });

  await adminRepository.createAuditLog({
    actorId,
    action: 'USER_DELETED',
    targetModel: 'User',
    targetId: id,
    changes: { email: user.email, name: user.name },
  });

  logger.warn('Admin: User deleted', { targetUserId: id, actorId });
  return { deleted: true };
};

exports.getUserStats = async () => {
  const [growth, roleBreakdown] = await Promise.all([
    adminRepository.getUserGrowthStats(),
    adminRepository.getUserRoleBreakdown(),
  ]);
  return { growth, roleBreakdown };
};

// ─── OPPORTUNITY MANAGEMENT ──────────────────────────────────────────────────

exports.listOpportunities = async (query) => {
  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit) || 20));
  const search = query.search?.trim() || null;
  const type = query.type || null;
  const isActive =
    query.isActive === 'true' ? true : query.isActive === 'false' ? false : undefined;

  const { opportunities, total } = await adminRepository.findAllOpportunities({
    page, limit, search, type, isActive,
  });

  return {
    opportunities,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
};

exports.getOpportunityById = async (id) => {
  const opp = await adminRepository.findOpportunityById(id);
  if (!opp) throw Object.assign(new Error('Opportunity not found'), { status: 404 });
  return opp;
};

exports.updateOpportunity = async (id, updates, actorId) => {
  const opp = await adminRepository.updateOpportunity(id, updates);
  if (!opp) throw Object.assign(new Error('Opportunity not found'), { status: 404 });

  await adminRepository.createAuditLog({
    actorId,
    action: 'OPPORTUNITY_UPDATED',
    targetModel: 'Opportunity',
    targetId: id,
    changes: updates,
  });

  return opp;
};

exports.deleteOpportunity = async (id, actorId) => {
  const opp = await adminRepository.deleteOpportunity(id);
  if (!opp) throw Object.assign(new Error('Opportunity not found'), { status: 404 });

  await adminRepository.createAuditLog({
    actorId,
    action: 'OPPORTUNITY_DELETED',
    targetModel: 'Opportunity',
    targetId: id,
    changes: { title: opp.title },
  });

  logger.warn('Admin: Opportunity deleted', { opportunityId: id, actorId });
  return { deleted: true };
};

exports.getOpportunityStats = async () => {
  const typeBreakdown = await adminRepository.getOpportunityTypeBreakdown();
  return { typeBreakdown };
};

// ─── AI USAGE ────────────────────────────────────────────────────────────────

exports.listAiUsage = async (query) => {
  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit) || 20));

  return adminRepository.findAiUsageLogs({
    page,
    limit,
    userId: query.userId || null,
    feature: query.feature || null,
    startDate: query.startDate || null,
    endDate: query.endDate || null,
  });
};

exports.getAiUsageSummary = async () => adminRepository.getAiUsageSummary();

// ─── AUDIT LOGS ──────────────────────────────────────────────────────────────

exports.listAuditLogs = async (query) => {
  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit) || 20));

  return adminRepository.findAuditLogs({
    page,
    limit,
    actorId: query.actorId || null,
    action: query.action || null,
    targetModel: query.targetModel || null,
    startDate: query.startDate || null,
    endDate: query.endDate || null,
  });
};

// ─── DASHBOARD ───────────────────────────────────────────────────────────────

exports.getDashboard = async () => {
  const counts = await adminRepository.getDashboardCounts();
  return { ...counts, timestamp: new Date().toISOString() };
};

// ─── TAXONOMY ────────────────────────────────────────────────────────────────

exports.fetchCareerTaxonomy = async () => getCareerTaxonomy();

exports.updateCareerTaxonomy = async (taxonomy, actorId) => {
  if (!taxonomy || typeof taxonomy !== 'object') {
    throw Object.assign(new Error('taxonomy must be a valid object'), { status: 400 });
  }
  const saved = await setCareerTaxonomy(taxonomy);

  await adminRepository.createAuditLog({
    actorId,
    action: 'TAXONOMY_UPDATED',
    targetModel: 'Taxonomy',
  });

  return saved;
};

// ─── OPPORTUNITY REFRESH ─────────────────────────────────────────────────────

async function performRefresh({ runBackfill, runFetch, triggeredBy }) {
  const startedAt = new Date();
  let backfill = { processed: 0, updated: 0 };
  let fetch = {
    jobApis: { new: 0, skipped: 0, total: 0 },
    rss: { new: 0, skipped: 0, errors: 0 },
  };

  try {
    if (runBackfill) {
      const cursor = Opportunity.find({ isActive: true }).cursor();
      const bulkOps = [];

      for await (const opp of cursor) {
        backfill.processed += 1;
        const baseText = `${opp.title || ''} ${opp.company || ''} ${opp.description || ''}`;
        const extracted = extractSkillsEnhanced(baseText);
        if (extracted.length === 0) continue;

        const existing = Array.isArray(opp.skills) ? opp.skills : [];
        const merged = Array.from(new Set([...existing, ...extracted])).slice(0, 12);

        if (
          merged.length !== existing.length ||
          merged.some((skill, idx) => skill !== existing[idx])
        ) {
          bulkOps.push({
            updateOne: { filter: { _id: opp._id }, update: { $set: { skills: merged } } },
          });
          backfill.updated += 1;
        }

        if (bulkOps.length >= 500) {
          await Opportunity.bulkWrite(bulkOps);
          bulkOps.length = 0;
        }
      }

      if (bulkOps.length > 0) await Opportunity.bulkWrite(bulkOps);
    }

    if (runFetch) {
      try { fetch.jobApis = await fetchAndSaveJobs(); } catch (e) {
        logger.error('Admin: Error fetching job APIs', e);
      }
      try { fetch.rss = await fetchAllFeeds(); } catch (e) {
        logger.error('Admin: Error fetching RSS feeds', e);
      }
    }

    const finishedAt = new Date();
    const durationMs = finishedAt.getTime() - startedAt.getTime();

    const record = await RefreshRun.create({
      startedAt, finishedAt, durationMs, triggeredBy,
      backfill, fetch, status: 'success',
    });

    logger.info('Admin: Refresh completed', { triggeredBy, durationMs, backfill, fetch });
    return { message: 'Refresh completed', backfill, fetch, refreshId: record._id };
  } catch (error) {
    const finishedAt = new Date();
    await RefreshRun.create({
      startedAt, finishedAt,
      durationMs: finishedAt.getTime() - startedAt.getTime(),
      triggeredBy, status: 'error', error: error.message,
    }).catch((e) => logger.error('Admin: Failed to record refresh error', e));

    throw error;
  }
}

exports.refreshOpportunities = async ({ runBackfill, runFetch, triggeredBy }) =>
  performRefresh({ runBackfill, runFetch, triggeredBy });

exports.seedOpportunities = async () => {
  const { opportunities, seedOpportunities } = require('../../../scripts/seedOpportunities');
  return seedOpportunities().then((result) => ({
    count: result?.count || opportunities.length,
    new: result?.new || 0,
    skipped: result?.skipped || 0,
  }));
};
