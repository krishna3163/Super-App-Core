import mongoose from 'mongoose';

const channelSchema = new mongoose.Schema({
  serverId: { type: mongoose.Schema.Types.ObjectId, ref: 'Server', required: true },
  name: { type: String, required: true },
  type: { type: String, enum: ['text', 'voice', 'announcement', 'stage', 'forum', 'media'], default: 'text' },
  topic: { type: String, default: '' },
  position: { type: Number, default: 0 },
  categoryId: { type: String },
  isNsfw: { type: Boolean, default: false },
  slowmodeSeconds: { type: Number, default: 0 },
  permissionOverrides: [{
    roleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Role' },
    allow: [String],
    deny: [String]
  }],
  pinnedMessages: [{ type: mongoose.Schema.Types.ObjectId, ref: 'DiscordMessage' }],
  lastMessageAt: { type: Date },
  // Voice channel specific
  bitrate: { type: Number, default: 64000 },
  userLimit: { type: Number, default: 0 },
  // Forum specific
  forumTags: [{ name: String, emoji: String, color: String }],
  defaultSortOrder: { type: String, enum: ['latest', 'creation'], default: 'latest' }
}, { timestamps: true });

export default mongoose.model('Channel', channelSchema);
