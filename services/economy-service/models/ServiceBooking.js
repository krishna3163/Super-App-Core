import mongoose from 'mongoose';

const serviceBookingSchema = new mongoose.Schema({
  customerId: { type: String, required: true },
  providerId: { type: mongoose.Schema.Types.ObjectId, ref: 'ServiceProvider', required: true },
  description: { type: String, required: true },
  date: { type: Date, required: true },
  status: { 
    type: String, 
    enum: ['requested', 'accepted', 'in_progress', 'completed', 'cancelled'], 
    default: 'requested' 
  },
  agreedPrice: { type: Number },
  paymentStatus: { type: String, enum: ['pending', 'paid', 'refunded'], default: 'pending' },
  chatId: { type: String } // Reference to a Chat room for negotiation
}, { timestamps: true });

export default mongoose.model('ServiceBooking', serviceBookingSchema);
