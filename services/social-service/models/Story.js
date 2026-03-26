import mongoose from 'mongoose';

const storySchema = new mongoose.Schema({
  userId: { type: String, required: true },
  userName: { type: String, default: '' },
  userAvatar: { type: String, default: '' },
  mediaUrl: { type: String, required: true },
  media: { type: String }, // legacy compat
  mediaType: { type: String, enum: ['image', 'video'], default: 'image' },
  caption: { type: String, default: '' },
  likes: [String],
  viewers: [String],
  createdAt: { type: Date, default: Date.now, expires: 86400 } // 24h TTL
}, { timestamps: true });

export default mongoose.model('Story', storySchema);
