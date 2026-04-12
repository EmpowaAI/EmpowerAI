

const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const pendingUserSchema = new mongoose.Schema(
  {
    name: {
      type:     String,
      required: [true, 'Name is required'],
      trim:     true,
    },
    email: {
      type:      String,
      required:  [true, 'Email is required'],
      unique:    true,
      lowercase: true,
      trim:      true,
    },
    password: {
      type:      String,
      required:  [true, 'Password is required'],
      minlength: 8,
      select:    false,
    },


    emailToken:        { type: String, required: true },
    emailTokenExpires: { type: Date,   required: true },

    deleteAt: {
      type:    Date,
      default: () => new Date(Date.now() + 60 * 60 * 1000),
      expires: 0,
    },

    // ─── POPIA Consent ────────────────────────────────────────────────────────
   
    consentDataProcessing: {
      type:     Boolean,
      required: [true, 'Privacy Policy consent is required'],
      default:  false,
    },

    consentProfileSharing: {
      type:     Boolean,
      required: [true, 'Profile sharing consent is required'],
      default:  false,
    },

    consentAiProcessing: {
      type:    Boolean,
      default: false,
    },

    consentTimestamp: { type: Date,   select: false },
    consentIp:        { type: String, select: false },
  },
  { timestamps: true }
);


pendingUserSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
});

module.exports = mongoose.model('PendingUser', pendingUserSchema);
