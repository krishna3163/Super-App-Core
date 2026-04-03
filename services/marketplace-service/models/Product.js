import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  sellerId: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: String, required: true },
  images: [String], // array of URLs
  location: {
    type: { type: String, default: 'Point' },
    coordinates: [Number], // [longitude, latitude]
    address: String
  },
  status: { type: String, enum: ['available', 'sold', 'deleted'], default: 'available' },
  wishlist: [String], // userIds
  avgRating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },
}, { timestamps: true });

productSchema.index({ location: '2dsphere' });
productSchema.index({ title: 'text', description: 'text' });

export default mongoose.model('Product', productSchema);
