import mongoose from 'mongoose';

const pageSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  ownerId: { type: String, required: true },
  followers: [String], // userIds
  category: { type: String },
  coverPhoto: { type: String },
  profilePhoto: { type: String }
}, { timestamps: true });

export default mongoose.model('Page', pageSchema);
