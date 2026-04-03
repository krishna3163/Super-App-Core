import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  sender: { type: String, required: true }, // userId
  content: { type: String, trim: true },
  chat: { type: mongoose.Schema.Types.ObjectId, ref: 'Chat' },
  messageType: { type: String, enum: ['text', 'image', 'file', 'voice', 'video', 'location'], default: 'text' },
  readBy: [{
    userId: String,
    readAt: { type: Date, default: Date.now }
  }],
  deliveredAt: { type: Date },
  isEdited: { type: Boolean, default: false },
  deletedAt: { type: Date },
  expiresAt: { type: Date },
  reactions: [{
    user: String,
    emoji: String
  }],
  encryptedContent: { type: String }, // For E2EE
  encryptionKeyId: { type: String },
  replyTo: { type: mongoose.Schema.Types.ObjectId, ref: 'Message' },
}, { timestamps: true });

export default mongoose.model('Message', messageSchema);
