import mongoose from 'mongoose';

const connectionSchema = new mongoose.Schema({
  requesterId: { type: String, required: true },
  recipientId: { type: String, required: true },
  status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
}, { timestamps: true });

export default mongoose.model('Connection', connectionSchema);
