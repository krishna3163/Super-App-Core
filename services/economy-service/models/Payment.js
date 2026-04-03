import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  targetId: { type: String, required: true }, // Could be bookingId, orderId, rideId
  targetType: { type: String, enum: ['service', 'product', 'ride', 'food'], required: true },
  amount: { type: Number, required: true },
  upiId: { type: String }, // Manual UPI payment flow
  transactionRef: { type: String },
  status: { type: String, enum: ['pending', 'success', 'failed'], default: 'pending' },
  qrCodeUrl: { type: String }
}, { timestamps: true });

export default mongoose.model('Payment', paymentSchema);
