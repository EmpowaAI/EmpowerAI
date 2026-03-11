/**
 * PendingUser Model
 * Stores unverified registrations temporarily.
 * Documents are auto-deleted after 1 hour via TTL index (deleteAt field).
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const pendingUserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 8,
      select: false,
    },

    // Verification token (hashed)
    emailToken:        { type: String, required: true },
    emailTokenExpires: { type: Date,   required: true },

    // TTL index - MongoDB auto-deletes document after this date (1 hour)
    deleteAt: {
      type:    Date,
      default: () => new Date(Date.now() + 60 * 60 * 1000),
      expires: 0,
    },
  },
  { timestamps: true }
);

// Hash password before saving
// Using async without next - supported in Mongoose 5.11+
pendingUserSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
});

module.exports = mongoose.model('PendingUser', pendingUserSchema);
