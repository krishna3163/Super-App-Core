import mongoose from 'mongoose';

const streakSchema = new mongoose.Schema({
  users: [{ type: String, required: true }], // array of 2 userIds
  count: { type: Number, default: 0 },
  lastInteraction: { type: Date, default: Date.now },
  expiresAt: { type: Date, default: () => new Date(Date.now() + 24 * 60 * 60 * 1000) },
}, { timestamps: true });

streakSchema.index({ users: 1 });

export default mongoose.model('Streak', streakSchema);
