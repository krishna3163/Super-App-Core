import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  groupId: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', required: true, index: true },
  senderId: { type: String, required: true },
  content: { type: String, trim: true },
  mediaUrls: [String],
  messageType: { type: String, enum: ['text', 'image', 'video', 'file'], default: 'text' },
  readBy: [{
    userId: String,
    readAt: { type: Date, default: Date.now }
  }],
  reactions: [{
    user: String,
    emoji: String
  }],
  pinnedAt: { type: Date },
}, { timestamps: true });

export default mongoose.model('Message', messageSchema);
