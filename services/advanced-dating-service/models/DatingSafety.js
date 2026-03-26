import mongoose from 'mongoose';

const datingSafetySchema = new mongoose.Schema({
  reporterId: { type: String, required: true },
  reportedId: { type: String, required: true },
  reason: { type: String, required: true },
  evidence: [String], // URLs to screenshots/logs
  status: { type: String, enum: ['pending', 'investigated', 'banned'], default: 'pending' },
}, { timestamps: true });

export default mongoose.model('DatingSafety', datingSafetySchema);
