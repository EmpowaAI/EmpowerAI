const mongoose = require('mongoose');

const Subscription = require('../modules/subscription/subscription.model');
const Usage = require('../modules/usage/usage.model');
const { SUBSCRIPTION_STATUS, BILLING_CYCLES } = require('../config/plans.config');

// ─── CONNECT ──────────────────────────────────────────────────────────────────

const connect = async () => {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI environment variable is not set');

  await mongoose.connect(uri, {
    dbName: process.env.MONGODB_DB_NAME || 'empowerai',
  });

  console.log('[MongoDB] Connected to', mongoose.connection.name);
};

// ─── SUBSCRIPTION REPOSITORY ──────────────────────────────────────────────────

const subscriptions = {
  async findByUserId(userId) {
    return Subscription.findByUserId(userId);
  },

  async findById(id) {
    return Subscription.findById(id);
  },

  async findByPaystackSubscriptionCode(code) {
    return Subscription.findByPaystackSubscriptionCode(code);
  },

  async findByPaystackCustomerCode(code) {
    return Subscription.findByPaystackCustomerCode(code);
  },

  async create(data) {
    const subscription = new Subscription(data);
    return subscription.save();
  },

  async update(id, data) {
    return Subscription.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true, runValidators: true }
    );
  },

  async findMany(filters = {}, { page = 1, limit = 20 } = {}) {
    const query = {};

    if (filters.status) query.status = filters.status;
    if (filters.planId) query.planId = filters.planId;
    if (filters.trialEndsAt?.$lte) query.trialEndsAt = { $lte: filters.trialEndsAt.$lte };

    const [data, total] = await Promise.all([
      Subscription.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Subscription.countDocuments(query),
    ]);

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  },

  async findExpiredTrials() {
    return Subscription.findExpiredTrials();
  },
};

// ─── USERS REPOSITORY ─────────────────────────────────────────────────────────

const users = {
  async findById(id) {
    // TODO: replace with your actual User model
    // e.g. return User.findById(id);
    throw new Error('users.findById not implemented — wire to your User model');
  },
};

module.exports = { connect, subscriptions, users };
