import mongoose from 'mongoose';

const serverSchema = new mongoose.Schema({
  name: { type: String, required: true },
  icon: { type: String, default: '' },
  banner: { type: String, default: '' },
  ownerId: { type: String, required: true },
  description: { type: String, default: '' },
  region: { type: String, default: 'India' },
  members: [{
    userId: String,
    roles: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Role' }],
    nickname: String,
    joinedAt: { type: Date, default: Date.now },
    isMuted: { type: Boolean, default: false },
    isDeafened: { type: Boolean, default: false }
  }],
  categories: [{
    name: String,
    position: Number,
    channels: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Channel' }]
  }],
  bans: [{
    userId: String,
    reason: String,
    bannedBy: String,
    bannedAt: { type: Date, default: Date.now }
  }],
  invites: [{
    code: { type: String, unique: true },
    createdBy: String,
    maxUses: { type: Number, default: 0 },
    uses: { type: Number, default: 0 },
    expiresAt: Date,
    channel: String
  }],
  settings: {
    verificationLevel: { type: String, enum: ['none', 'low', 'medium', 'high'], default: 'none' },
    defaultNotifications: { type: String, enum: ['all', 'mentions'], default: 'all' },
    explicitContentFilter: { type: String, enum: ['off', 'members_without_roles', 'all'], default: 'off' },
    systemChannel: { type: String },
    rulesChannel: { type: String }
  },
  boostCount: { type: Number, default: 0 },
  boostLevel: { type: Number, default: 0 },
  memberCount: { type: Number, default: 0 },
  isPublic: { type: Boolean, default: false },
  isVerified: { type: Boolean, default: false },
  tags: [String],
  customEmojis: [{ name: String, url: String, createdBy: String }]
}, { timestamps: true });

export default mongoose.model('Server', serverSchema);
