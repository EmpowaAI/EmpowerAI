const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, index: true, sparse: true },
  password: { type: String, required: true, select: false },
  age: { type: Number, index: true },
  province: { type: String, index: true },
  education: { type: String },
  skills: [{ type: String }],
  interests: [{ type: String }],
  avatar: { type: String },

   // New fields
  isVerified: { type: Boolean, default: false },
  emailToken: { type: String, select: false },
  emailTokenExpires: { type: Date, select: false },
  resetToken: { type: String, select: false },
  resetTokenExpires: { type: Date, select: false }
}, { 
  timestamps: true,
  // Optimize queries by excluding password by default
  toJSON: { virtuals: true, transform: function(doc, ret) { delete ret.password; return ret; } },
  toObject: { virtuals: true, transform: function(doc, ret) { delete ret.password; return ret; } }
});

// Hash password before saving
// Using 10 rounds instead of 12 for better performance (still secure)
// 12 rounds can take 300-500ms, 10 rounds takes ~100ms
userSchema.pre('save', async function() {
  if (!this.isModified('password')) {
    return;
  }
  this.password = await bcrypt.hash(this.password, 10);
});

// Compare password method
userSchema.methods.correctPassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);