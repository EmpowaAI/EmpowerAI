/**
 * GetUserDTO
 * Shapes outgoing user data returned to the client.
 * Ensures sensitive fields (password, tokens) are never exposed
 * regardless of what the DB document contains.
 *
 * Used by: userService.getUserProfile, userService.findById (any public-facing return)
 */

// ─────────────────────────────────────────────
// DTO builder — maps a User document to a safe response shape
// ─────────────────────────────────────────────
const toGetUserDTO = (user) => ({
  id:        user._id,
  name:      user.name,
  email:     user.email,
  avatar:    user.avatar    ?? null,
  isVerified: user.isVerified,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

module.exports = { toGetUserDTO };
