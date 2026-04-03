import mongoose from 'mongoose';

const inviteLinkSchema = new mongoose.Schema({
  token: { type: String, required: true, unique: true },
  targetId: { type: String, required: true }, // groupId, serverId, or communityId
  targetType: { type: String, enum: ['group', 'server', 'community'], required: true },
  creatorId: { type: String, required: true },
  expiresAt: { type: Date }, // Optional expiration
  maxUses: { type: Number }, // Optional usage limit
  currentUses: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.model('InviteLink', inviteLinkSchema);
