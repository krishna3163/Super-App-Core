import mongoose from 'mongoose';

const storyViewSchema = new mongoose.Schema({
  storyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Story', required: true, index: true },
  viewerId: { type: String, required: true },
  viewedAt: { type: Date, default: Date.now },
}, { timestamps: true });

storyViewSchema.index({ storyId: 1, viewerId: 1 }, { unique: true });

export default mongoose.model('StoryView', storyViewSchema);
