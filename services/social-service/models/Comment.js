import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema({
  postId: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true },
  userId: { type: String, required: true },
  userName: { type: String, default: '' },
  userAvatar: { type: String, default: '' },
  content: { type: String, required: true },
  likes: [String],
  replies: [{
    userId: String,
    userName: String,
    content: String,
    createdAt: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

export default mongoose.model('Comment', commentSchema);
