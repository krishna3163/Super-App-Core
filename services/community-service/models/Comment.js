import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema({
  postId: { type: mongoose.Schema.Types.ObjectId, ref: 'CommunityPost', required: true, index: true },
  parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Comment', default: null },
  userId: { type: String, required: true },
  userName: { type: String },
  userAvatar: { type: String },
  content: { type: String, required: true },
  upvotes: [String],
  downvotes: [String],
  score: { type: Number, default: 0 },
  isEdited: { type: Boolean, default: false },
  isRemoved: { type: Boolean, default: false },
  depth: { type: Number, default: 0 },
  awards: [{ type: String, givenBy: String }]
}, { timestamps: true });

commentSchema.index({ postId: 1, parentId: 1, score: -1 });

export default mongoose.model('Comment', commentSchema);
