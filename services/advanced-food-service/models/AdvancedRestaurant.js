import mongoose from 'mongoose';

const advancedRestaurantSchema = new mongoose.Schema({
  name: { type: String, required: true },
  ownerId: { type: String, required: true },
  location: {
    type: { type: String, default: 'Point' },
    coordinates: [Number]
  },
  menu: [{
    id: String,
    name: String,
    price: Number,
    category: String,
    image: String,
    isAvailable: { type: Boolean, default: true }
  }],
  isOpen: { type: Boolean, default: true },
}, { timestamps: true });

advancedRestaurantSchema.index({ location: '2dsphere' });

export default mongoose.model('AdvancedRestaurant', advancedRestaurantSchema);
