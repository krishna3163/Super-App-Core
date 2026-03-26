import mongoose from 'mongoose';

const paymentProfileSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  walletId: { type: String, required: true, unique: true },
  balance: { type: Number, default: 0 },
  coins: { type: Number, default: 0 },
  upiId: { type: String, required: true, unique: true },
  qrCode: { type: String }, // Base64 or URL
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.model('PaymentProfile', paymentProfileSchema);
