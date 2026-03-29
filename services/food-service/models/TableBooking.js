import mongoose from 'mongoose';

const tableBookingSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
  guestName: { type: String, required: true },
  phone: { type: String, required: true },
  guests: { type: Number, required: true },
  bookingDate: { type: Date, required: true },
  bookingTime: { type: String, required: true }, // e.g., "19:30"
  status: { type: String, enum: ['pending', 'confirmed', 'completed', 'cancelled'], default: 'pending' },
  specialRequests: { type: String },
  advanceAmount: { type: Number, default: 0 },
  paymentStatus: { type: String, enum: ['pending', 'paid'], default: 'pending' }
}, { timestamps: true });

export default mongoose.model('TableBooking', tableBookingSchema);
