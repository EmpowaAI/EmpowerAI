const EconomicTwin = require('./twinBuilder.Model');

/**
 * =========================
 * GET TWIN
 * =========================
 */
const findByUserId = async (userId) => {
  return EconomicTwin.findOne({ user: userId }).populate('cvProfile');
};

/**
 * =========================
 * UPSERT TWIN (safe + atomic)
 * =========================
 */
const upsertTwin = async (userId, data) => {
  return EconomicTwin.findOneAndUpdate(
    { user: userId },
    {
      $set: {
        ...data,
        user: userId,
        updatedAt: new Date(),
      },
    },
    {
      new: true,
      upsert: true,
      runValidators: true,
      setDefaultsOnInsert: true,
    }
  );
};

/**
 * =========================
 * CHAT APPEND (atomic + safe)
 * =========================
 * Uses $push + $slice instead of read-modify-write
 */
const appendChatMessage = async (userId, message) => {
  return EconomicTwin.findOneAndUpdate(
    { user: userId },
    {
      $push: {
        chatHistory: {
          $each: [message],
          $slice: -100, // keep last 100 automatically
        },
      },
      $set: { updatedAt: new Date() },
    },
    { new: true }
  );
};

/**
 * =========================
 * SIMULATION APPEND (atomic + safe)
 * =========================
 */
const appendSimulation = async (userId, simulationEntry) => {
  return EconomicTwin.findOneAndUpdate(
    { user: userId },
    {
      $push: {
        simulationHistory: {
          $each: [simulationEntry],
          $slice: -20,
        },
      },
      $set: { updatedAt: new Date() },
    },
    { new: true }
  );
};

/**
 * =========================
 * SAFE FIELD UPDATE
 * =========================
 * Only allows controlled updates
 */
const updateFields = async (userId, fields) => {
  const allowedFields = [
    'analysis',
    'identity',
    'economy',
    'skills',
    'market',
    'intelligence',
    'status',
    'evolution',
    'lastCalculatedAt',
  ];

  const safeUpdate = {};

  for (const key of allowedFields) {
    if (fields[key] !== undefined) {
      safeUpdate[key] = fields[key];
    }
  }

  return EconomicTwin.findOneAndUpdate(
    { user: userId },
    {
      $set: {
        ...safeUpdate,
        updatedAt: new Date(),
      },
    },
    { new: true, runValidators: true }
  );
};

/**
 * =========================
 * DELETE TWIN
 * =========================
 */
const deleteByUserId = async (userId) => {
  return EconomicTwin.findOneAndDelete({ user: userId });
};

module.exports = {
  findByUserId,
  upsertTwin,
  appendChatMessage,
  appendSimulation,
  updateFields,
  deleteByUserId,
};