/**
 * User Repository
 * Single repository for all user-related database operations
 * Used by AuthService, AccountService, and UserService
 * Handles all interactions with the User model, including:
 * - Finding users by various criteria (ID, email, tokens)
 * - Creating new users
 * - Updating user information and tokens
 * - Deleting users
 *
 * Note: This repository is focused on database interactions and does not contain any business logic or validation, which are responsibilities of the service layer.
 */

class UserRepository {
  constructor(UserModel) {
    this.User = UserModel;
  }

  //---------------------------------
  // Find operations
  //---------------------------------

  async findById(id) {
    return await this.User.findById(id);
  }

  async findByEmail(email) {
    return await this.User.findOne({ email: email.toLowerCase() });
  }

  async findByEmailWithPassword(email) {
  return await this.User.findOne({ email: email.toLowerCase() }).select('+password');
}

  async findByEmailToken(token) {
    return await this.User.findOne({
      emailToken: token,
      emailTokenExpires: { $gt: Date.now() },
    });
  }

  async findByResetToken(token) {
    return await this.User.findOne({
      resetToken: token,
      resetTokenExpires: { $gt: Date.now() },
    });
  }

  async findByRefreshToken(refreshToken) {
    return await this.User.findOne({ refreshToken });
  }

  async existsByEmail(email) {
    const user = await this.User.findOne({ email: email.toLowerCase() });
    return !!user;
  }

  //---------------------------------
  // Create operations
  //---------------------------------

  async create(userData) {
    const user = new this.User({
      ...userData,
      email: userData.email.toLowerCase(),
    });
    return await user.save();
  }

  //---------------------------------
  // Update operations
  //---------------------------------

  async update(id, updateData) {
    return await this.User.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });
  }

  async updateRefreshToken(id, refreshToken, expiresAt) {
    return await this.User.findByIdAndUpdate(
      id,
      { refreshToken, refreshTokenExpires: expiresAt },
      { new: true, runValidators: true }
    );
  }

  async invalidateRefreshToken(id) {
    return await this.User.findByIdAndUpdate(
      id,
      { refreshToken: null, refreshTokenExpires: null },
      { new: true, runValidators: true }
    );
  }

  //---------------------------------
  // Delete operations
  //---------------------------------

  async delete(id) {
    return await this.User.findByIdAndDelete(id);
  }
}

module.exports = UserRepository;