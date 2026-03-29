import mongoose from 'mongoose';

const channelSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  topic: { type: String, default: '' },
  avatar: { type: String },
  ownerId: { type: String, required: true },
  serverId: { type: mongoose.Schema.Types.ObjectId, ref: 'Server' },
  
  // Discord-like features
  type: { type: String, enum: ['text', 'voice', 'announcement', 'stage', 'forum', 'media', 'broadcast'], default: 'broadcast' },
  isNsfw: { type: Boolean, default: false },
  slowmodeSeconds: { type: Number, default: 0 },
  
  // Members and Roles
  admins: [{ type: String }],
  subscribers: [{ type: String }], // userIds
  
  // Granular Permissions (Role based access)
  permissionOverrides: [{
    roleId: { type: String }, // can be generic string like 'member', 'admin' or specific user/role ID
    allow: [String], // e.g., ['SEND_MESSAGES', 'ATTACH_FILES']
    deny: [String]
  }],
  
  pinnedMessages: [{ type: String }], // message IDs
  
  // Voice channel specific
  bitrate: { type: Number, default: 64000 },
  userLimit: { type: Number, default: 0 }, // 0 = unlimited
  
  // Forum specific
  forumTags: [{ name: String, emoji: String, color: String }],
  defaultSortOrder: { type: String, enum: ['latest', 'creation'], default: 'latest' },
  
  inviteCode: { type: String, unique: true },
  welcomeMessage: { type: String, default: '' },
  
  // Parent/Thread support
  parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Channel' },
  isThread: { type: Boolean, default: false },
  threadArchiveDuration: { type: Number, default: 1440 }, // minutes
  
  lastMessageAt: { type: Date }
}, { timestamps: true });

export default mongoose.model('Channel', channelSchema);
