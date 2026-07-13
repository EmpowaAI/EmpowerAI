/**
 * GetUserDTO
 * Shapes outgoing user data returned to the client.
 * Ensures sensitive fields (password, tokens) are never exposed
 * regardless of what the DB document contains.
 *
 * Used by: userService.getUserProfile, userService.findById (any public-facing return)
 */

// ─────────────────────────────────────────────
// DTO builder - maps a User document to a safe response shape
// ─────────────────────────────────────────────
const toGetUserDTO = (user) => ({
  id:        user.id,
  name:      user.name,
  email:     user.email,
  age:       user.age        ?? null,
  province:  user.province   ?? null,
  phone:     user.phone      ?? null,
  education: user.education  ?? null,
  about:     user.about      ?? null,
  summary:   user.summary    ?? null,
  skills:    user.skills     ?? [],
  interests: user.interests  ?? [],
  avatar:    user.avatar     ?? null,
  role:      user.role,
  createdAt: user.created_at,
  updatedAt: user.updated_at,
});

module.exports = { toGetUserDTO };
