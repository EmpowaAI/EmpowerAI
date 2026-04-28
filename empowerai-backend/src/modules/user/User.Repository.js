'use strict';

const mongoose    = require('mongoose');
const User        = require('./user.Model');
const PendingUser = require('../userAccount/PendingUser.Model');
const { encryptProfile, decryptProfile } = require('../../utils/encryption.util');


class UserRepository {

  // ───────────── USER CORE ─────────────────────────────────────────────────

  /**
   * Find a user by ID and return decrypted profile fields.
   * Returns null for invalid IDs or missing documents.
   */
  async findById(userId) {
    if (!mongoose.Types.ObjectId.isValid(userId)) return null;
    const user = await User.findById(userId);
    return decryptProfile(user);
  }

  /**
   * Find a user by email.
   * Password is excluded by default — pass includePassword = true for auth flows.
   * Profile fields are decrypted before returning.
   */
  async findByEmail(email, includePassword = false) {
    const query = User.findOne({ email: email.toLowerCase() });
    query.select(includePassword ? '+password' : '-password');
    const user = await query;
    return decryptProfile(user);
  }

  /**
   * Lightweight email existence check — no decryption needed (no PII returned).
   */
  async existsByEmail(email) {
    return !!await User.findOne({ email: email.toLowerCase() }).lean();
  }

  /**
   * Create a new user.
   * Encrypts PII profile fields before writing to the DB.
   */
  async createUser(data) {
    const encrypted = encryptProfile(data);
    return User.create(encrypted);
  }

  /**
   * Partial update (PATCH) — encrypts only the fields present in the payload.
   * Returns the updated document with PII decrypted.
   */
  async updateUser(userId, fields) {
    const encrypted = encryptProfile(fields);
    const user = await User.findByIdAndUpdate(
      userId,
      { $set: encrypted },
      { new: true, runValidators: true }
    );
    return decryptProfile(user);
  }

  /**
   * Save a Mongoose document directly (used by auth flows that mutate the doc).
   * No encryption here — callers manipulating token / auth fields directly
   * should not be passing PII through this path.
   */
  async saveUser(user) {
    return user.save();
  }

  /**
   * Hard-delete a user by ID.
   */
  async deleteUser(userId) {
    return User.findByIdAndDelete(userId);
  }


  // ───────────── PENDING USER ───────────────────────────────────────────────

  /**
   * Create a pending (unverified) user.
   * Encrypts PII profile fields if present at registration time.
   */
  async createPendingUser(data) {
    const encrypted = encryptProfile(data);
    return PendingUser.create(encrypted);
  }

  /**
   * Find a pending user by email — used to prevent duplicate registrations.
   * No decryption needed (only email is checked here).
   */
  async findPendingByEmail(email) {
    return PendingUser.findOne({ email: email.toLowerCase() });
  }

  /**
   * Find a pending user by their hashed email verification token.
   * Password is included so it can be promoted to the User collection.
   * Returns the raw document — decryption handled by the promotion service.
   */
  async findPendingByEmailToken(token) {
    return PendingUser.findOne({
      emailToken:        token,
      emailTokenExpires: { $gt: Date.now() },
    }).select('+password');
  }

  /**
   * Lightweight pending-email existence check.
   */
  async pendingExistsByEmail(email) {
    return !!await PendingUser.findOne({ email: email.toLowerCase() }).lean();
  }

  /**
   * Delete a pending user after successful promotion to User.
   */
  async deletePendingUser(pendingId) {
    return PendingUser.findByIdAndDelete(pendingId);
  }
}


module.exports = new UserRepository();
