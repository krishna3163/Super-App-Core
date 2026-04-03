import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  hotelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hotel', required: true },
  hotelOwnerId: { type: String, default: '' },
  roomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
  roomType: { type: String, default: '' },
  guestName: { type: String, default: '' },
  phone: { type: String, default: '' },
  guests: { type: Number, default: 2 },
  checkIn: { type: Date, required: true },
  checkOut: { type: Date, required: true },
  totalPrice: { type: Number, required: true },
  paymentMethod: { type: String, default: 'card' },
  status: { type: String, enum: ['pending', 'confirmed', 'checked_in', 'checked_out', 'cancelled'], default: 'pending' },
  paymentStatus: { type: String, enum: ['pending', 'paid'], default: 'pending' },
  bookingChat: [{
    senderId: String,
    senderName: String,
    message: String,
    createdAt: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

export default mongoose.model('Booking', bookingSchema);
