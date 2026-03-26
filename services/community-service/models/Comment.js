import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema({
  threadId: { type: mongoose.Schema.Types.ObjectId, ref: 'Thread', required: true },
  authorId: { type: String, required: true },
  parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Comment', default: null }, // for nesting
  content: { type: String, required: true },
  upvotes: [String], // array of userIds
  downvotes: [String], // array of userIds
}, { timestamps: true });

export default mongoose.model('Comment', commentSchema);
