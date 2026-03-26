import mongoose from 'mongoose';

const profilePrivacySchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  fields: {
    phoneNumber: { type: String, enum: ['public', 'friends', 'private', 'custom'], default: 'private' },
    email: { type: String, enum: ['public', 'friends', 'private', 'custom'], default: 'private' },
    bio: { type: String, enum: ['public', 'friends', 'private', 'custom'], default: 'public' },
    lastSeen: { type: String, enum: ['public', 'friends', 'private', 'custom'], default: 'friends' },
    profilePicture: { type: String, enum: ['public', 'friends', 'private', 'custom'], default: 'public' },
    status: { type: String, enum: ['public', 'friends', 'private', 'custom'], default: 'friends' },
  },
  customAllowedUsers: [{ type: String }],
  customBlockedUsers: [{ type: String }]
}, { timestamps: true });

export default mongoose.model('ProfilePrivacy', profilePrivacySchema);
