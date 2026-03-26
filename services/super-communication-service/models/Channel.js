import mongoose from 'mongoose';

const channelSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  avatar: { type: String },
  ownerId: { type: String, required: true },
  admins: [{ type: String }],
  subscribers: [{ type: String }], // userIds
  inviteCode: { type: String, unique: true },
}, { timestamps: true });

export default mongoose.model('Channel', channelSchema);
