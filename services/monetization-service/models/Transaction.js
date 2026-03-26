import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  amount: { type: Number, required: true },
  type: { type: String, enum: ['deposit', 'withdrawal', 'transfer', 'purchase', 'tip'], required: true },
  assetType: { type: String, enum: ['currency', 'coins'], default: 'currency' },
  status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'completed' },
  metadata: { 
    targetUserId: String,
    reason: String, // e.g., 'profile_boost', 'food_order', 'gift'
    orderId: String
  }
}, { timestamps: true });

export default mongoose.model('Transaction', transactionSchema);
