import mongoose from 'mongoose';

const superChatSchema = new mongoose.Schema({
  participants: [{ type: String, required: true }], // userIds
  isGroup: { type: Boolean, default: false },
  chatName: { type: String }, // For groups
  groupAdmin: { type: String },
  latestMessage: { type: mongoose.Schema.Types.ObjectId, ref: 'SuperMessage' },
  pinnedBy: [String], // Array of userIds who pinned this chat
  archivedBy: [String], // Array of userIds who archived this chat
  disappearingMessagesTime: { type: Number, default: 0 }, // in seconds. 0 = off
  unreadCount: {
    type: Map,
    of: Number,
    default: {}
  }
}, { timestamps: true });

export default mongoose.model('SuperChat', superChatSchema);
