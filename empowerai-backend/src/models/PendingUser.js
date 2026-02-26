const mongoose = require('mongoose');

const pendingUserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // hash before storing
  emailToken: { type: String, required: true },
  emailTokenExpires: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now },
});

// Optional: Automatically remove expired pending users
pendingUserSchema.index({ emailTokenExpires: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('PendingUser', pendingUserSchema);