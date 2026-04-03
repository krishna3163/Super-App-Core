import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema({
  reporterId: { type: String, required: true },
  reportedId: { type: String, required: true },
  reason: { type: String, enum: ['spam', 'abuse', 'inappropriate', 'other'], required: true },
  description: { type: String },
  contextData: { type: Object }, // E.g., messageId or sessionId
  status: { type: String, enum: ['pending', 'reviewed', 'resolved'], default: 'pending' }
}, { timestamps: true });

export default mongoose.model('Report', reportSchema);
