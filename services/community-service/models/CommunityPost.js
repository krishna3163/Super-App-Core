import mongoose from 'mongoose';

const communityPostSchema = new mongoose.Schema({
  communityId: { type: mongoose.Schema.Types.ObjectId, ref: 'Community', required: true, index: true },
  communityName: { type: String },
  userId: { type: String, required: true },
  userName: { type: String },
  userAvatar: { type: String },
  title: { type: String, required: true },
  content: { type: String },
  type: { type: String, enum: ['text', 'link', 'image', 'video', 'poll'], default: 'text' },
  media: [String],
  link: { type: String },
  flair: { name: String, color: String },
  poll: {
    options: [{ text: String, votes: [String] }],
    endsAt: Date,
    totalVotes: { type: Number, default: 0 }
  },
  upvotes: [String],
  downvotes: [String],
  score: { type: Number, default: 0 },
  commentCount: { type: Number, default: 0 },
  shareCount: { type: Number, default: 0 },
  viewCount: { type: Number, default: 0 },
  isPinned: { type: Boolean, default: false },
  isLocked: { type: Boolean, default: false },
  isRemoved: { type: Boolean, default: false },
  removedReason: { type: String },
  isApproved: { type: Boolean, default: true },
  reports: [{ userId: String, reason: String, createdAt: Date }],
  awards: [{ type: String, givenBy: String, givenAt: Date }]
}, { timestamps: true });

communityPostSchema.index({ communityId: 1, score: -1, createdAt: -1 });

export default mongoose.model('CommunityPost', communityPostSchema);
