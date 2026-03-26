import mongoose from 'mongoose';

const matchSchema = new mongoose.Schema({
  users: [{ type: String, required: true }], // Array of 2 userIds
  status: { type: String, enum: ['pending', 'matched', 'blocked'], default: 'pending' },
  lastMessage: { type: String },
}, { timestamps: true });

export default mongoose.model('Match', matchSchema);
