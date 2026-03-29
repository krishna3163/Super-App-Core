import mongoose from 'mongoose';

const wishlistSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  hotelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hotel', required: true },
  notes: { type: String, default: '' },
  plannedCheckIn: { type: Date },
  plannedCheckOut: { type: Date },
  priceAlert: { type: Boolean, default: false },
  targetPrice: { type: Number }
}, { timestamps: true });

wishlistSchema.index({ userId: 1, hotelId: 1 }, { unique: true });

export default mongoose.model('HotelWishlist', wishlistSchema);
