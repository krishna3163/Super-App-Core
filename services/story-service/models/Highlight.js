import mongoose from 'mongoose';

const highlightSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  name: { type: String, required: true },
  coverImage: { type: String, default: '' },
  storyIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Story' }],
  position: { type: Number, default: 0 }
}, { timestamps: true });

export default mongoose.model('Highlight', highlightSchema);
