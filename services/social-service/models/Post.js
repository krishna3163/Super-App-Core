import mongoose from 'mongoose';

const postSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  userName: { type: String, default: '' },
  userAvatar: { type: String, default: '' },
  type: { type: String, enum: ['text', 'image', 'video', 'poll', 'event', 'alert', 'notice', 'reminder'], default: 'text' },
  content: { type: String, required: true },
  media: [{
    url: String,
    mediaType: { type: String, enum: ['image', 'video'], default: 'image' }
  }],
  hashtags: [String],
  likes: [String],       // array of userIds
  interested: [String],  // array of userIds (for events)
  shares: [String],      // array of userIds
  savedBy: [String],     // array of userIds
  isReel: { type: Boolean, default: false },
  metadata: { type: mongoose.Schema.Types.Mixed }, // For polls, events, etc.
  // Poll votes: { optionIndex: [userId, ...] }
  pollVotes: { type: Map, of: [String], default: {} }
}, { timestamps: true });

postSchema.index({ createdAt: -1 });
postSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model('Post', postSchema);
