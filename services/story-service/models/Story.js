import mongoose from 'mongoose';

const storySchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  userName: { type: String, default: '' },
  userAvatar: { type: String, default: '' },
  mediaUrl: { type: String, required: true },
  mediaType: { type: String, enum: ['image', 'video', 'text', 'boomerang'], default: 'image' },
  caption: { type: String, default: '' },
  textContent: { type: String }, // For text-only stories
  backgroundColor: { type: String, default: '#000000' },
  fontStyle: { type: String, default: 'normal' },
  stickers: [{
    type: { type: String, enum: ['emoji', 'location', 'mention', 'hashtag', 'poll', 'quiz', 'countdown', 'link'] },
    content: String,
    position: { x: Number, y: Number },
    scale: { type: Number, default: 1 },
    rotation: { type: Number, default: 0 }
  }],
  music: {
    trackName: String,
    artist: String,
    previewUrl: String,
    startTime: { type: Number, default: 0 }
  },
  location: {
    name: String,
    lat: Number,
    lon: Number
  },
  mentions: [String],
  hashtags: [String],
  viewers: [{
    userId: String,
    viewedAt: { type: Date, default: Date.now }
  }],
  reactions: [{
    userId: String,
    emoji: String,
    reactedAt: { type: Date, default: Date.now }
  }],
  replies: [{
    userId: String,
    userName: String,
    message: String,
    createdAt: { type: Date, default: Date.now }
  }],
  viewCount: { type: Number, default: 0 },
  isHighlight: { type: Boolean, default: false },
  highlightName: { type: String },
  privacy: { type: String, enum: ['everyone', 'close_friends', 'custom'], default: 'everyone' },
  allowedUsers: [String], // for custom privacy
  hiddenFrom: [String],
  isActive: { type: Boolean, default: true },
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 24 * 60 * 60 * 1000),
    index: { expires: '24h' }
  }
}, { timestamps: true });

storySchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model('Story', storySchema);
