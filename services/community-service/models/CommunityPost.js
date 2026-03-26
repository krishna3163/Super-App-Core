import mongoose from 'mongoose';

const communityPostSchema = new mongoose.Schema({
  communityId: { type: mongoose.Schema.Types.ObjectId, ref: 'Community', required: true },
  userId: { type: String, required: true },
  content: { type: String, required: true },
  media: [{ url: String, type: { type: String, enum: ['image', 'video'] } }],
  upvotes: [{ type: String }],
  downvotes: [{ type: String }],
  commentCount: { type: Number, default: 0 }
}, { timestamps: true });

export default mongoose.model('CommunityPost', communityPostSchema);
