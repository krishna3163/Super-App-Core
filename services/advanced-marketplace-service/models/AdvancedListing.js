import mongoose from 'mongoose';

const listingSchema = new mongoose.Schema({
  sellerId: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: String, enum: ['devices', 'books', 'rentals', 'fashion', 'other'], required: true },
  images: [String],
  location: {
    type: { type: String, default: 'Point' },
    coordinates: [Number]
  },
  isBiddable: { type: Boolean, default: false },
  startingBid: { type: Number },
  status: { type: String, enum: ['available', 'sold', 'deleted'], default: 'available' },
  sellerRating: { type: Number, default: 5 },
}, { timestamps: true });

listingSchema.index({ location: '2dsphere' });
listingSchema.index({ title: 'text', description: 'text' });

export default mongoose.model('AdvancedListing', listingSchema);
