const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      index: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
      minlength: 8,
      select: false,
    },

    avatar: {
      type: String,
      default: null,
    },

    // -------------------------
    // ACCOUNT STATUS
    // -------------------------
    isVerified: {
      type: Boolean,
      default: false,
    },

    // -------------------------
    // EMAIL VERIFICATION
    // -------------------------
    emailToken: {
      type: String,
      select: false,
    },

    emailTokenExpires: {
      type: Date,
      select: false,
    },

    // -------------------------
    // PASSWORD RESET
    // -------------------------
    resetToken: {
      type: String,
      select: false,
    },

    resetTokenExpires: {
      type: Date,
      select: false,
    },

    // -------------------------
    // EMAIL CHANGE FLOW
    // -------------------------
    pendingEmail: {
      type: String,
      default: null,
      lowercase: true,
      trim: true,
      select: false,
    },

    // -------------------------
    // ACCOUNT DELETION FLOW
    // -------------------------
    deleteToken: {
      type: String,
      select: false,
    },

    deleteTokenExpires: {
      type: Date,
      select: false,
    },
  },
  {
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
  }
);

// -------------------------
// HASH PASSWORD BEFORE SAVE
// -------------------------
userSchema.pre('save', async function (next) {
  try {
    if (!this.isModified('password')) return next();

    this.password = await bcrypt.hash(this.password, 12);
    next();
  } catch (err) {
    next(err);
  }
});

// -------------------------
// PASSWORD CHECK METHOD
// -------------------------
userSchema.methods.isPasswordCorrect = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);