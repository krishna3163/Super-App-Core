import mongoose from 'mongoose';

const aiLogSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  action: { type: String, enum: ['summarize', 'reply', 'ask'], required: true },
  promptLength: { type: Number },
  responseLength: { type: Number },
}, { timestamps: true });

export default mongoose.model('AILog', aiLogSchema);
