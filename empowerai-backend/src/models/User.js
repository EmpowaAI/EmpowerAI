const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, index: true },
  password: { type: String, required: true, select: false },
  age: { type: Number, index: true },
  province: { type: String, index: true },
  education: { type: String },
  skills: [{ type: String }],
  interests: [{ type: String }],
  avatar: { type: String }
}, { 
  timestamps: true,
  // Optimize queries by excluding password by default
  toJSON: { virtuals: true, transform: function(doc, ret) { delete ret.password; return ret; } },
  toObject: { virtuals: true, transform: function(doc, ret) { delete ret.password; return ret; } }
});

// Hash password before saving
userSchema.pre('save', async function() {
  if (!this.isModified('password')) {
    return;
  }
  this.password = await bcrypt.hash(this.password, 12);
});

// Compare password method
userSchema.methods.correctPassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);