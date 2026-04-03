import mongoose from 'mongoose';

const statusSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  content: { type: String }, // For text status
  mediaUrl: { type: String },
  mediaType: { type: String, enum: ['image', 'video', 'text'] },
  viewers: [{ type: String }], // userIds
  expiresAt: { type: Date, default: () => new Date(Date.now() + 24 * 60 * 60 * 1000), index: { expires: 0 } },
}, { timestamps: true });

export default mongoose.model('Status', statusSchema);
