import mongoose from 'mongoose';

const communitySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  displayName: { type: String },
  description: { type: String, default: '' },
  icon: { type: String, default: '' },
  banner: { type: String, default: '' },
  creatorId: { type: String, required: true },
  moderators: [{ userId: String, addedAt: { type: Date, default: Date.now } }],
  members: [String],
  memberCount: { type: Number, default: 0 },
  category: { type: String, enum: ['tech', 'gaming', 'sports', 'music', 'art', 'education', 'business', 'lifestyle', 'news', 'memes', 'science', 'health', 'food', 'travel', 'other'], default: 'other' },
  tags: [String],
  rules: [{ title: String, description: String }],
  flairs: [{ name: String, color: String, textColor: { type: String, default: '#ffffff' } }],
  settings: {
    postApproval: { type: Boolean, default: false },
    restrictPosting: { type: Boolean, default: false },
    allowPolls: { type: Boolean, default: true },
    allowMedia: { type: Boolean, default: true },
    nsfw: { type: Boolean, default: false },
    minAccountAge: { type: Number, default: 0 }, // days
    minKarma: { type: Number, default: 0 }
  },
  isPublic: { type: Boolean, default: true },
  isVerified: { type: Boolean, default: false },
  isFeatured: { type: Boolean, default: false },
  bannedUsers: [{ userId: String, reason: String, bannedAt: Date }],
  reportedCount: { type: Number, default: 0 }
}, { timestamps: true });

communitySchema.index({ name: 'text', tags: 'text' });

export default mongoose.model('Community', communitySchema);
