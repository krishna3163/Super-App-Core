import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['user', 'moderator', 'admin'],
    default: 'user'
  },
  loginAttempts: {
    type: Number,
    required: true,
    default: 0
  },
  lockUntil: {
    type: Number
  },
  refreshTokens: [String],
  twoFactorEnabled: {
    type: Boolean,
    default: false
  },
  twoFactorType: {
    type: String,
    enum: ['sms', 'email', 'authenticator'],
    default: 'authenticator'
  },
  twoFactorSecret: {
    type: String
  },
  twoFactorRecoveryCodes: [String],
  twoFactorPhone: {
    type: String
  },
  activeSessions: [{
    token: String,
    deviceIp: String,
    userAgent: String,
    lastActive: { type: Date, default: Date.now }
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model('User', userSchema);
