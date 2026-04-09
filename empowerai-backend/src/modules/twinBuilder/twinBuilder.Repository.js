/**
 * EconomicTwin Repository
 * Data access layer — no business logic, only DB operations.
 */

const EconomicTwin = require('./twinBuilder.Model');

/**
 * Find a twin by userId (matches model field `user`)
 */
const findByUserId = async (userId) => {
  return EconomicTwin.findOne({ user: userId }).populate('cvProfile');
};

/**
 * Create or update a twin atomically.
 * Always uses `user` field (not `userId`) to match the schema.
 */
const upsertTwin = async (userId, data) => {
  return EconomicTwin.findOneAndUpdate(
    { user: userId },
    { ...data, user: userId },
    {
      new: true,
      upsert: true,
      runValidators: true,
      setDefaultsOnInsert: true,
    }
  );
};

/**
 * Append a chat message to twin.chatHistory.
 * Caps history at 100 messages to prevent unbounded growth.
 */
const appendChatMessage = async (userId, message) => {
  const MAX_HISTORY = 100;

  const twin = await EconomicTwin.findOne({ user: userId });
  if (!twin) return null;

  const history = twin.chatHistory || [];
  history.push(message);

  const trimmed = history.length > MAX_HISTORY
    ? history.slice(-MAX_HISTORY)
    : history;

  return EconomicTwin.findOneAndUpdate(
    { user: userId },
    { chatHistory: trimmed, updatedAt: new Date() },
    { new: true }
  );
};

/**
 * Append a simulation run to twin.simulationHistory.
 * Caps at 20 entries.
 */
const appendSimulation = async (userId, simulationEntry) => {
  const MAX_HISTORY = 20;

  const twin = await EconomicTwin.findOne({ user: userId });
  if (!twin) return null;

  let history = twin.simulationHistory || [];
  history.push(simulationEntry);

  if (history.length > MAX_HISTORY) {
    history = history.slice(-MAX_HISTORY);
  }

  return EconomicTwin.findOneAndUpdate(
    { user: userId },
    { simulationHistory: history },
    { new: true }
  );
};

/**
 * Update specific top-level fields on the twin.
 */
const updateFields = async (userId, fields) => {
  return EconomicTwin.findOneAndUpdate(
    { user: userId },
    { ...fields, updatedAt: new Date() },
    { new: true, runValidators: true }
  );
};

/**
 * Delete a twin (used in tests / admin ops).
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
