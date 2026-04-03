import mongoose from 'mongoose';

const groupSchema = new mongoose.Schema({
  chatId: { type: mongoose.Schema.Types.ObjectId, ref: 'SuperChat', required: true },
  description: { type: String },
  avatar: { type: String },
  admins: [{ type: String }], // userIds
  onlyAdminsCanMessage: { type: Boolean, default: false },
  inviteCode: { type: String, unique: true },
}, { timestamps: true });

export default mongoose.model('Group', groupSchema);
