import mongoose from 'mongoose';

const groupSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String },
  profilePictureUrl: { type: String },
  createdBy: { type: String, required: true },
  members: [{
    userId: { type: String, required: true },
    role: { type: String, enum: ['admin', 'moderator', 'member'], default: 'member' },
    joinedAt: { type: Date, default: Date.now },
    mutedUntil: { type: Date },
    isBanned: { type: Boolean, default: false }
  }],
  settings: {
    whoCanSendMessages: { type: String, enum: ['everyone', 'adminsOnly'], default: 'everyone' },
    whoCanEditInfo: { type: String, enum: ['everyone', 'adminsOnly'], default: 'everyone' },
    whoCanSeeMembers: { type: String, enum: ['everyone', 'adminsOnly'], default: 'everyone' },
    disappearingMessages: { type: Number, default: 0 } // in hours
  }
}, { timestamps: true });

export default mongoose.model('Group', groupSchema);
