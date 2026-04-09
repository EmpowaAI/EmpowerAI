const User = require('../models/User');
const PendingUser = require('../userAccount/PendingUser.Model');
const mongoose = require('mongoose');

class UserRepository {

  // ───────── USER CORE ─────────

  async findById(userId) {
    if (!mongoose.Types.ObjectId.isValid(userId)) return null;
    return User.findById(userId);
  }

  async findByEmail(email, includePassword = false) {
    const query = User.findOne({ email: email.toLowerCase() });
    query.select(includePassword ? '+password' : '-password');
    return query;
  }

  async existsByEmail(email) {
    return !!await User.findOne({ email: email.toLowerCase() }).lean();
  }

  async createUser(data) {
    return User.create(data);
  }

  async updateUser(userId, fields) {
    return User.findByIdAndUpdate(
      userId,
      { $set: fields },
      { new: true, runValidators: true }
    );
  }

  async saveUser(user) {
    return user.save();
  }

  async deleteUser(userId) {
    return User.findByIdAndDelete(userId);
  }

  // ───────── PENDING USER ─────────

  async createPendingUser(data) {
    return PendingUser.create(data);
  }

  async findPendingByEmail(email) {
    return PendingUser.findOne({ email: email.toLowerCase() });
  }

  async findPendingByEmailToken(token) {
    return PendingUser.findOne({
      emailToken: token,
      emailTokenExpires: { $gt: Date.now() },
    }).select('+password');
  }

  async pendingExistsByEmail(email) {
    return !!await PendingUser.findOne({ email: email.toLowerCase() }).lean();
  }

  async deletePendingUser(pendingId) {
    return PendingUser.findByIdAndDelete(pendingId);
  }
}

module.exports = new UserRepository();