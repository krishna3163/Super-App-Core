import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  bio: {
    type: String,
    default: '',
  },
  avatar: {
    type: String,
    default: '',
  },
  coverPhoto: {
    type: String,
    default: '',
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  kycStatus: {
    type: String,
    enum: ['unverified', 'pending', 'verified', 'rejected'],
    default: 'unverified',
  },
  kycDocuments: [String],
  profileCompleteness: {
    type: Number,
    default: 0,
  },
  phone: {
    type: String,
  },
  username: {
    type: String,
    unique: true,
  },
  followers: [{
    type: String, // userId
  }],
  following: [{
    type: String, // userId
  }],
  blocked: [{
    type: String, // userId
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

userSchema.index({ userId: 1 });
userSchema.index({ username: 1 });
userSchema.index({ createdAt: -1 });

export default mongoose.model('User', userSchema);
