import mongoose from 'mongoose';

const discordMessageSchema = new mongoose.Schema({
  channelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Channel', required: true, index: true },
  serverId: { type: mongoose.Schema.Types.ObjectId, ref: 'Server', required: true },
  authorId: { type: String, required: true },
  authorName: { type: String },
  authorAvatar: { type: String },
  content: { type: String, default: '' },
  type: { type: String, enum: ['default', 'reply', 'system', 'pin', 'thread_starter'], default: 'default' },
  attachments: [{
    url: String,
    filename: String,
    size: Number,
    contentType: String
  }],
  embeds: [{
    title: String,
    description: String,
    url: String,
    color: String,
    image: String,
    fields: [{ name: String, value: String, inline: Boolean }]
  }],
  reactions: [{
    emoji: String,
    count: { type: Number, default: 0 },
    users: [String]
  }],
  mentions: [String],
  mentionRoles: [String],
  mentionEveryone: { type: Boolean, default: false },
  replyTo: { type: mongoose.Schema.Types.ObjectId, ref: 'DiscordMessage' },
  threadId: { type: mongoose.Schema.Types.ObjectId, ref: 'Channel' },
  isPinned: { type: Boolean, default: false },
  isEdited: { type: Boolean, default: false },
  editedAt: { type: Date },
  isDeleted: { type: Boolean, default: false }
}, { timestamps: true });

discordMessageSchema.index({ channelId: 1, createdAt: -1 });

export default mongoose.model('DiscordMessage', discordMessageSchema);
