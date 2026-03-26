import mongoose from 'mongoose';

const discordMessageSchema = new mongoose.Schema({
  channelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Channel', required: true },
  authorId: { type: String, required: true },
  content: { type: String, required: true },
  mentions: [String], // userIds
  reactions: [{
    emoji: String,
    users: [String] // userIds
  }],
  isPinned: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.model('DiscordMessage', discordMessageSchema);
