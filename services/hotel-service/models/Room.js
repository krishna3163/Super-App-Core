import mongoose from 'mongoose';

const roomSchema = new mongoose.Schema({
  hotelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hotel', required: true },
  type: { type: String, required: true }, // e.g., 'Deluxe', 'Suite'
  price: { type: Number, required: true },
  capacity: { type: Number, default: 2 },
  amenities: [String],
  images: [String],
  totalRooms: { type: Number, default: 1 },
  availableRooms: { type: Number, default: 1 },
}, { timestamps: true });

export default mongoose.model('Room', roomSchema);
