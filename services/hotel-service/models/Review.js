import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  hotelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hotel', required: true, index: true },
  userId: { type: String, required: true },
  userName: { type: String, default: 'Guest' },
  userAvatar: { type: String, default: '' },
  bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
  rating: { type: Number, required: true, min: 1, max: 5 },
  title: { type: String, default: '' },
  comment: { type: String, required: true },
  pros: [String],
  cons: [String],
  photos: [String],
  categories: {
    cleanliness: { type: Number, min: 1, max: 5 },
    service: { type: Number, min: 1, max: 5 },
    location: { type: Number, min: 1, max: 5 },
    value: { type: Number, min: 1, max: 5 },
    amenities: { type: Number, min: 1, max: 5 }
  },
  travelType: { type: String, enum: ['business', 'couple', 'family', 'solo', 'friends'], default: 'solo' },
  stayDate: { type: Date },
  likes: [String],
  helpful: { type: Number, default: 0 },
  ownerReply: {
    message: { type: String },
    repliedAt: { type: Date }
  },
  isVerified: { type: Boolean, default: false },
  status: { type: String, enum: ['active', 'reported', 'hidden'], default: 'active' }
}, { timestamps: true });

reviewSchema.index({ hotelId: 1, rating: -1 });
reviewSchema.index({ userId: 1, hotelId: 1 });

export default mongoose.model('HotelReview', reviewSchema);
