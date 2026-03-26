import mongoose from 'mongoose';

const communitySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: { type: String },
  creatorId: { type: String, required: true },
  members: [{ type: String }],
  rules: [String],
  tags: [String],
  isPrivate: { type: Boolean, default: false },
  avatar: { type: String },
  coverImage: { type: String }
}, { timestamps: true });

export default mongoose.model('Community', communitySchema);
