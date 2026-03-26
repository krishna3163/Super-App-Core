import mongoose from 'mongoose';

const threadSchema = new mongoose.Schema({
  communityId: { type: mongoose.Schema.Types.ObjectId, ref: 'Community', required: true },
  authorId: { type: String, required: true },
  title: { type: String, required: true },
  content: { type: String, required: true },
  media: [String], // array of URLs
  upvotes: [String], // array of userIds
  downvotes: [String], // array of userIds
  commentCount: { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.model('Thread', threadSchema);
