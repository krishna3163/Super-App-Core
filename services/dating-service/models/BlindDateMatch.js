import mongoose from 'mongoose';

const blindDateMatchSchema = new mongoose.Schema({
  participants: [{
    userId: { type: String, required: true },
    isRevealed: { type: Boolean, default: false },
    tempNickname: { type: String }
  }],
  status: { type: String, enum: ['active', 'expired', 'revealed'], default: 'active' },
  chatId: { type: String },
  expiresAt: { type: Date, required: true }
}, { timestamps: true });

export default mongoose.model('BlindDateMatch', blindDateMatchSchema);
