import mongoose from 'mongoose';

const groupSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  creatorId: { type: String, required: true },
  members: [String], // userIds
  isPrivate: { type: Boolean, default: false },
  moderators: [String], // userIds
}, { timestamps: true });

export default mongoose.model('Group', groupSchema);
