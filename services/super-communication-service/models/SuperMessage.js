import mongoose from 'mongoose';

const superMessageSchema = new mongoose.Schema({
  chatId: { type: mongoose.Schema.Types.ObjectId, ref: 'SuperChat', required: true },
  senderId: { type: String, required: true },
  content: { type: String },
  attachments: [{
    type: { type: String, enum: ['image', 'video', 'document', 'voice'], required: true },
    url: { type: String, required: true },
    name: String,
    size: Number
  }],
  status: { type: String, enum: ['sent', 'delivered', 'read'], default: 'sent' },
  readBy: [{
    userId: String,
    readAt: { type: Date, default: Date.now }
  }],
  isEdited: { type: Boolean, default: false },
  isDeletedEveryone: { type: Boolean, default: false },
  replyTo: { type: mongoose.Schema.Types.ObjectId, ref: 'SuperMessage', default: null },
  forwardedFrom: { type: mongoose.Schema.Types.ObjectId, ref: 'SuperMessage', default: null },
  reactions: [{
    userId: String,
    emoji: String
  }],
  starredBy: [String], // Array of userIds
  
  // Phase AI6 & AI7: Media & Lifecycle
  viewOnce: { type: Boolean, default: false },
  expiryTime: { type: Date }, // For disappearing messages
}, { timestamps: true });

// Background Job Alternative: TTL Index for disappearing messages
// superMessageSchema.index({ expiryTime: 1 }, { expireAfterSeconds: 0 });

// Index for message search
superMessageSchema.index({ content: 'text' });

export default mongoose.model('SuperMessage', superMessageSchema);
