const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    enum: ['admin', 'lawyer', 'assistant', 'paralegal'],
    default: 'lawyer'
  },
  profile: {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    phone: String,
    avatar: String,
    barNumber: String, // Bar admission number
    specialization: [String], // Areas of legal practice
    department: String
  },
  permissions: {
    canCreateClients: { type: Boolean, default: true },
    canEditClients: { type: Boolean, default: true },
    canDeleteClients: { type: Boolean, default: false },
    canAccessFinancials: { type: Boolean, default: false },
    canManageUsers: { type: Boolean, default: false }
  },
  notificationSettings: {
    emailNotifications: { type: Boolean, default: true },
    caseUpdates: { type: Boolean, default: true },
  },
  isActive: { type: Boolean, default: true },
  lastLogin: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Update lastLogin
userSchema.methods.updateLastLogin = function() {
  this.lastLogin = new Date();
  return this.save();
};

// Get public user data (excluding sensitive information)
userSchema.methods.getPublicData = function() {
  const userObject = this.toObject();
  delete userObject.password;
  delete userObject.passwordResetToken;
  delete userObject.passwordResetExpires;
  return userObject;
};

module.exports = mongoose.model('User', userSchema);