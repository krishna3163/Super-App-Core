import mongoose from 'mongoose';

const followerSchema = new mongoose.Schema({
  followerId: { type: String, required: true },
  followingId: { type: String, required: true },
  status: { type: String, enum: ['pending', 'accepted', 'blocked'], default: 'accepted' },
}, { timestamps: true });

followerSchema.index({ followerId: 1, followingId: 1 }, { unique: true });

export default mongoose.model('Follower', followerSchema);
