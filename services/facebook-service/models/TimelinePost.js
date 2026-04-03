import mongoose from 'mongoose';

const timelinePostSchema = new mongoose.Schema({
  authorId: { type: String, required: true, index: true },
  authorName: { type: String },
  authorAvatar: { type: String },
  targetId: { type: String }, // profile wall
  targetType: { type: String, enum: ['profile', 'page', 'group'], default: 'profile' },
  content: { type: String },
  media: [{
    url: String,
    type: { type: String, enum: ['image', 'video', 'gif'] },
    width: Number,
    height: Number
  }],
  feeling: { emoji: String, text: String },
  location: { name: String, lat: Number, lon: Number },
  taggedUsers: [{ userId: String, userName: String }],
  privacy: { type: String, enum: ['public', 'friends', 'only_me', 'custom'], default: 'public' },
  reactions: [{
    userId: String,
    type: { type: String, enum: ['like', 'love', 'haha', 'wow', 'sad', 'angry'], default: 'like' }
  }],
  reactionCounts: {
    like: { type: Number, default: 0 },
    love: { type: Number, default: 0 },
    haha: { type: Number, default: 0 },
    wow: { type: Number, default: 0 },
    sad: { type: Number, default: 0 },
    angry: { type: Number, default: 0 }
  },
  comments: [{
    userId: String,
    userName: String,
    userAvatar: String,
    content: String,
    reactions: [{ userId: String, type: String }],
    replies: [{
      userId: String,
      userName: String,
      content: String,
      createdAt: { type: Date, default: Date.now }
    }],
    createdAt: { type: Date, default: Date.now }
  }],
  shares: [{ userId: String, shareType: { type: String, enum: ['share', 'repost'] }, sharedAt: Date }],
  shareCount: { type: Number, default: 0 },
  commentCount: { type: Number, default: 0 },
  isSharedPost: { type: Boolean, default: false },
  originalPostId: { type: mongoose.Schema.Types.ObjectId, ref: 'TimelinePost' },
  isEdited: { type: Boolean, default: false },
  isHidden: { type: Boolean, default: false }
}, { timestamps: true });

timelinePostSchema.index({ authorId: 1, createdAt: -1 });

export default mongoose.model('TimelinePost', timelinePostSchema);
