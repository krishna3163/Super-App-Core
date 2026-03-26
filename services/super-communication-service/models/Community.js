import mongoose from 'mongoose';

const communitySchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  avatar: { type: String },
  ownerId: { type: String, required: true },
  announcementGroupId: { type: mongoose.Schema.Types.ObjectId, ref: 'SuperChat' },
  groupIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'SuperChat' }],
}, { timestamps: true });

export default mongoose.model('Community', communitySchema);
