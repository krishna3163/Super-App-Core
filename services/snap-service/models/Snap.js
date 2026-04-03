import mongoose from 'mongoose';

const snapSchema = new mongoose.Schema({
  senderId: { type: String, required: true },
  receiverId: { type: String, required: true }, // can be userId or groupId
  mediaUrl: { type: String, required: true },
  mediaType: { type: String, enum: ['image', 'video'], default: 'image' },
  duration: { type: Number, default: 10 }, // 1-10 seconds
  ttlSeconds: { type: Number, default: 10 }, 
  viewOnce: { type: Boolean, default: true },
  isViewed: { type: Boolean, default: false },
  viewedAt: { type: Date },
  isScreenshotted: { type: Boolean, default: false },
  replayCount: { type: Number, default: 0 },
  expiresAt: { type: Date, default: () => new Date(Date.now() + 24 * 60 * 60 * 1000), index: { expires: 0 } },
}, { timestamps: true });

export default mongoose.model('Snap', snapSchema);
