const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name:     { type: String, required: true },
  email:    { type: String, required: true, unique: true, index: true, sparse: true },
  password: { type: String, required: true, select: false },

  age:       { type: Number, index: true },
  province:  { type: String, index: true },
  education: { type: String },
  skills:    [{ type: String }],
  interests: [{ type: String }],
  avatar:    { type: String },

  // Verification
  isVerified:        { type: Boolean, default: false },
  emailToken:        { type: String, select: false },
  emailTokenExpires: { type: Date,   select: false },

  // Password reset
  resetToken:        { type: String, select: false },
  resetTokenExpires: { type: Date,   select: false },

  // Email change (two-step: stores new email until confirmed)
  pendingEmail:      { type: String, default: null, select: false },

  // Account deletion (two-step: token sent via email)
  deleteToken:        { type: String, select: false },
  deleteTokenExpires: { type: Date,   select: false },

}, {
  timestamps: true,
  toJSON:   { virtuals: true, transform: (doc, ret) => { delete ret.password; return ret; } },
  toObject: { virtuals: true, transform: (doc, ret) => { delete ret.password; return ret; } },
});

// Hash password before saving.
// Skips hashing if $locals.skipHash is true — used when promoting
// a PendingUser to User where the password is already hashed.
userSchema.pre('save', async function () {
  if (this.$locals.skipHash)        return; // already hashed by PendingUser
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 10);
});

// Compare password
userSchema.methods.correctPassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
