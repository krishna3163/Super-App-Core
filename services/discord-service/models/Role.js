import mongoose from 'mongoose';

const roleSchema = new mongoose.Schema({
  serverId: { type: mongoose.Schema.Types.ObjectId, ref: 'Server', required: true },
  name: { type: String, required: true },
  color: { type: String, default: '#99aab5' },
  icon: { type: String },
  hoist: { type: Boolean, default: false },
  position: { type: Number, default: 0 },
  permissions: [{
    type: String,
    enum: [
      'ADMINISTRATOR', 'MANAGE_SERVER', 'MANAGE_ROLES', 'MANAGE_CHANNELS',
      'KICK_MEMBERS', 'BAN_MEMBERS', 'MANAGE_MESSAGES', 'MENTION_EVERYONE',
      'VIEW_CHANNELS', 'SEND_MESSAGES', 'EMBED_LINKS', 'ATTACH_FILES',
      'READ_MESSAGE_HISTORY', 'ADD_REACTIONS', 'USE_VOICE', 'CONNECT',
      'SPEAK', 'STREAM', 'MUTE_MEMBERS', 'DEAFEN_MEMBERS', 'MOVE_MEMBERS',
      'MANAGE_EMOJIS', 'CREATE_INVITES', 'MANAGE_EVENTS', 'MANAGE_THREADS'
    ]
  }],
  isMentionable: { type: Boolean, default: false },
  isDefault: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.model('Role', roleSchema);
