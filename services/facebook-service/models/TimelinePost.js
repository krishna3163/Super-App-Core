import mongoose from 'mongoose';

const timelinePostSchema = new mongoose.Schema({
  authorId: { type: String, required: true },
  targetId: { type: String, required: true }, // userId, pageId, or groupId
  targetType: { type: String, enum: ['user', 'page', 'group'], default: 'user' },
  content: { type: String, required: true },
  media: [String],
  likes: [String], // userIds
  commentCount: { type: Number, default: 0 }
}, { timestamps: true });

export default mongoose.model('TimelinePost', timelinePostSchema);
