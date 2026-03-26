import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
  senderId: { type: String, required: true },
  receiverId: { type: String, required: true },
  amount: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'success', 'failed'], default: 'success' },
  reference: { type: String },
  type: { type: String, enum: ['add_money', 'transfer', 'payment', 'refund'], default: 'transfer' },
  description: { type: String }
}, { timestamps: true });

export default mongoose.model('Transaction', transactionSchema);
