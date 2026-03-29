import mongoose from 'mongoose';

const walletSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  balance: { type: Number, default: 0 },
  coins: { type: Number, default: 0 },
  pendingBalance: { type: Number, default: 0 },
  lifetimeEarnings: { type: Number, default: 0 },
  currency: { type: String, default: 'INR' }
}, { timestamps: true });

export default mongoose.model('Wallet', walletSchema);
