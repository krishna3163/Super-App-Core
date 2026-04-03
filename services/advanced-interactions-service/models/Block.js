import mongoose from 'mongoose';

const blockSchema = new mongoose.Schema({
  blockerId: { type: String, required: true },
  blockedId: { type: String, required: true },
}, { timestamps: true });

// Ensure a user can only block another user once
blockSchema.index({ blockerId: 1, blockedId: 1 }, { unique: true });

export default mongoose.model('Block', blockSchema);
