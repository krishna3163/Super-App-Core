import mongoose from 'mongoose';

const hotelSchema = new mongoose.Schema({
  name: { type: String, required: true, index: 'text' },
  description: { type: String },
  ownerId: { type: String, required: true, index: true },
  address: { type: String, required: true },
  city: { type: String, index: true },
  state: { type: String },
  country: { type: String, default: 'India' },
  pincode: { type: String },
  location: {
    type: { type: String, default: 'Point' },
    coordinates: [Number]
  },
  category: { type: String, enum: ['budget', 'standard', 'premium', 'luxury', 'resort', 'boutique', 'hostel'], default: 'standard' },
  starRating: { type: Number, min: 1, max: 5, default: 3 },
  amenities: [String],
  policies: {
    checkInTime: { type: String, default: '14:00' },
    checkOutTime: { type: String, default: '11:00' },
    cancellationPolicy: { type: String, enum: ['free', 'moderate', 'strict'], default: 'moderate' },
    petsAllowed: { type: Boolean, default: false },
    smokingAllowed: { type: Boolean, default: false },
    idRequired: { type: Boolean, default: true },
    couplesFriendly: { type: Boolean, default: true }
  },
  images: [String],
  coverImage: { type: String, default: '' },
  rating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },
  priceRange: {
    min: { type: Number, default: 0 },
    max: { type: Number, default: 0 }
  },
  contactPhone: { type: String },
  contactEmail: { type: String },
  website: { type: String },
  isVerified: { type: Boolean, default: false },
  isFeatured: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  tags: [String],
  nearbyAttractions: [{ name: String, distance: String }]
}, { timestamps: true });

hotelSchema.index({ location: '2dsphere' });
hotelSchema.index({ city: 1, category: 1, 'priceRange.min': 1 });

export default mongoose.model('Hotel', hotelSchema);
