import mongoose from 'mongoose';

const channelSchema = new mongoose.Schema({
  serverId: { type: mongoose.Schema.Types.ObjectId, ref: 'Server', required: true },
  name: { type: String, required: true },
  type: { type: String, enum: ['text', 'voice'], default: 'text' },
  permissions: [{
    roleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Role' },
    allow: [String], // e.g., ['SEND_MESSAGES', 'VIEW_CHANNEL']
    deny: [String]
  }]
}, { timestamps: true });

export default mongoose.model('Channel', channelSchema);
