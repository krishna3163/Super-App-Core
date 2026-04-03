import mongoose from 'mongoose';

const callLogSchema = new mongoose.Schema({
  callerId: { type: String, required: true },
  receiverId: { type: String }, // Can be null for group calls
  chatId: { type: String }, // Optional, if call is linked to a chat/group
  callType: { type: String, enum: ['voice', 'video'], required: true },
  isGroupCall: { type: Boolean, default: false },
  participants: [{ type: String }],
  status: { type: String, enum: ['missed', 'completed', 'rejected', 'ongoing'], default: 'ongoing' },
  startedAt: { type: Date, default: Date.now },
  endedAt: { type: Date },
  duration: { type: Number, default: 0 }, // in seconds
}, { timestamps: true });

export default mongoose.model('CallLog', callLogSchema);
