import mongoose from 'mongoose';

const storySchema = new mongoose.Schema({
  userId: { type: String, required: true },
  mediaUrl: { type: String, required: true },
  mediaType: { type: String, enum: ['image', 'video'], default: 'image' },
  caption: { type: String },
  viewers: [{ type: String }],
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 24 * 60 * 60 * 1000),
    index: { expires: '24h' }
  }
}, { timestamps: true });

export default mongoose.model('Story', storySchema);
