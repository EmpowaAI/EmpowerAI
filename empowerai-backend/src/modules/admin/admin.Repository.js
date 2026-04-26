const mongoose = require('mongoose');
const User = require('../user/user.Model');
const Opportunity = require('../opportunities/Opportunity.Model');
const RefreshRun = require('../../models/RefreshRun');
const CareerAnalytics = require('../../models/CareerAnalytics');
const AuditLog = require('../../models/auditLog');
const AiUsageLog = require('../../models/aiUsageLog');

// ─── USER QUERIES ────────────────────────────────────────────────────────────

exports.findAllUsers = async ({ page, limit, search, role, isActive }) => {
  const skip = (page - 1) * limit;

  const filter = {};
  if (role) filter.role = role;
  if (typeof isActive === 'boolean') filter.isActive = isActive;
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }

  const [users, total] = await Promise.all([
    User.find(filter)
      .select('-password -refreshToken')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    User.countDocuments(filter),
  ]);

  return { users, total };
};

exports.findUserById = async (id) =>
  User.findById(id).select('-password -refreshToken').lean();

exports.updateUser = async (id, updates) =>
  User.findByIdAndUpdate(id, { $set: updates }, { new: true, runValidators: true })
    .select('-password -refreshToken')
    .lean();

exports.deleteUser = async (id) => User.findByIdAndDelete(id).lean();

exports.toggleUserStatus = async (id, isActive) =>
  User.findByIdAndUpdate(id, { $set: { isActive } }, { new: true })
    .select('-password -refreshToken')
    .lean();

exports.getUserGrowthStats = async () => {
  return User.aggregate([
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
        },
        count: { $sum: 1 },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
    { $limit: 12 },
  ]);
};

exports.getUserRoleBreakdown = async () =>
  User.aggregate([
    { $group: { _id: '$role', count: { $sum: 1 } } },
  ]);

// ─── OPPORTUNITY QUERIES ─────────────────────────────────────────────────────

exports.findAllOpportunities = async ({ page, limit, search, type, isActive }) => {
  const skip = (page - 1) * limit;

  const filter = {};
  if (type) filter.type = type;
  if (typeof isActive === 'boolean') filter.isActive = isActive;
  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { company: { $regex: search, $options: 'i' } },
    ];
  }

  const [opportunities, total] = await Promise.all([
    Opportunity.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Opportunity.countDocuments(filter),
  ]);

  return { opportunities, total };
};

exports.findOpportunityById = async (id) =>
  Opportunity.findById(id).lean();

exports.updateOpportunity = async (id, updates) =>
  Opportunity.findByIdAndUpdate(id, { $set: updates }, { new: true, runValidators: true }).lean();

exports.deleteOpportunity = async (id) => Opportunity.findByIdAndDelete(id).lean();

exports.getOpportunityTypeBreakdown = async () =>
  Opportunity.aggregate([
    { $group: { _id: '$type', count: { $sum: 1 }, active: { $sum: { $cond: ['$isActive', 1, 0] } } } },
  ]);

// ─── AI USAGE QUERIES ────────────────────────────────────────────────────────

exports.findAiUsageLogs = async ({ page, limit, userId, feature, startDate, endDate }) => {
  const skip = (page - 1) * limit;

  const filter = {};
  if (userId) filter.userId = new mongoose.Types.ObjectId(userId);
  if (feature) filter.feature = feature;
  if (startDate || endDate) {
    filter.createdAt = {};
    if (startDate) filter.createdAt.$gte = new Date(startDate);
    if (endDate) filter.createdAt.$lte = new Date(endDate);
  }

  const [logs, total] = await Promise.all([
    AiUsageLog.find(filter)
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    AiUsageLog.countDocuments(filter),
  ]);

  return { logs, total };
};

exports.getAiUsageSummary = async () => {
  const [byFeature, byDay, topUsers] = await Promise.all([
    AiUsageLog.aggregate([
      {
        $group: {
          _id: '$feature',
          totalCalls: { $sum: 1 },
          totalTokens: { $sum: '$tokensUsed' },
          avgLatencyMs: { $avg: '$latencyMs' },
          errors: { $sum: { $cond: ['$isError', 1, 0] } },
        },
      },
      { $sort: { totalCalls: -1 } },
    ]),
    AiUsageLog.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' },
          },
          calls: { $sum: 1 },
          tokens: { $sum: '$tokensUsed' },
        },
      },
      { $sort: { '_id.year': -1, '_id.month': -1, '_id.day': -1 } },
      { $limit: 30 },
    ]),
    AiUsageLog.aggregate([
      { $group: { _id: '$userId', totalCalls: { $sum: 1 }, totalTokens: { $sum: '$tokensUsed' } } },
      { $sort: { totalCalls: -1 } },
      { $limit: 10 },
      { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' } },
      { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
      { $project: { totalCalls: 1, totalTokens: 1, 'user.name': 1, 'user.email': 1 } },
    ]),
  ]);

  return { byFeature, byDay, topUsers };
};

// ─── AUDIT LOG QUERIES ───────────────────────────────────────────────────────

exports.findAuditLogs = async ({ page, limit, actorId, action, targetModel, startDate, endDate }) => {
  const skip = (page - 1) * limit;

  const filter = {};
  if (actorId) filter.actorId = new mongoose.Types.ObjectId(actorId);
  if (action) filter.action = action;
  if (targetModel) filter.targetModel = targetModel;
  if (startDate || endDate) {
    filter.createdAt = {};
    if (startDate) filter.createdAt.$gte = new Date(startDate);
    if (endDate) filter.createdAt.$lte = new Date(endDate);
  }

  const [logs, total] = await Promise.all([
    AuditLog.find(filter)
      .populate('actorId', 'name email role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    AuditLog.countDocuments(filter),
  ]);

  return { logs, total };
};

exports.createAuditLog = async (entry) => AuditLog.create(entry);

// ─── DASHBOARD AGGREGATE ─────────────────────────────────────────────────────

exports.getDashboardCounts = async () => {
  const [
    totalUsers,
    activeUsers,
    totalOpportunities,
    activeOpportunities,
    totalAiCalls,
    recentRefreshRun,
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ isActive: true }),
    Opportunity.countDocuments(),
    Opportunity.countDocuments({ isActive: true }),
    AiUsageLog.countDocuments(),
    RefreshRun.findOne().sort({ startedAt: -1 }).lean(),
  ]);

  return {
    totalUsers,
    activeUsers,
    totalOpportunities,
    activeOpportunities,
    totalAiCalls,
    recentRefreshRun,
  };
};
