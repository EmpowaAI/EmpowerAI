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

  // ─── Verification ────────────────────────────────────────────────────────────
  isVerified:         { type: Boolean, default: false },
  emailToken:         { type: String, select: false },
  emailTokenExpires:  { type: Date,   select: false },

  // ─── Password reset ───────────────────────────────────────────────────────────
  resetToken:         { type: String, select: false },
  resetTokenExpires:  { type: Date,   select: false },

  // ─── Email change (two-step) ──────────────────────────────────────────────────
  pendingEmail:       { type: String, default: null, select: false },

  // ─── Account deletion (two-step) ─────────────────────────────────────────────
  deleteToken:        { type: String, select: false },
  deleteTokenExpires: { type: Date,   select: false },

  // ─── POPIA Consent (required at registration) ────────────────────────────────
  // Consent 1 (required): processing personal data per Privacy Policy
  consentDataProcessing: { type: Boolean, required: true, default: false },

  // Consent 2 (required): sharing profile with potential employers
  consentProfileSharing: { type: Boolean, required: true, default: false },

  // Consent 3 (recommended): AI-based matching and recommendations
  consentAiProcessing:   { type: Boolean, default: false },

  // Audit trail — timestamp + IP logged at the moment of consent
  consentTimestamp: { type: Date,   select: false },
  consentIp:        { type: String, select: false },

  // Inactivity tracking — used by the auto-delete cron job
  lastActiveAt:         { type: Date, default: Date.now },
  flaggedForDeletion:   { type: Boolean, default: false },

}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: (doc, ret) => {
      delete ret.password;
      return ret;
    },
  },
  toObject: {
    virtuals: true,
    transform: (doc, ret) => {
      delete ret.password;
      return ret;
    },
  },
});

// ─── Hash password before saving ─────────────────────────────────────────────
// Skips hashing if $locals.skipHash is true — used when promoting
// a PendingUser to User where the password is already hashed.
userSchema.pre('save', async function () {
  if (this.$locals.skipHash) return;
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 10);
});

// ─── Compare password ─────────────────────────────────────────────────────────
userSchema.methods.correctPassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
