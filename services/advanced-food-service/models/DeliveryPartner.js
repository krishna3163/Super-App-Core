import mongoose from 'mongoose';

const deliveryPartnerSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  vehicleInfo: String,
  status: { type: String, enum: ['available', 'busy', 'offline'], default: 'offline' },
  location: {
    type: { type: String, default: 'Point' },
    coordinates: [Number]
  },
  rating: { type: Number, default: 5 },
  earnings: { type: Number, default: 0 },
}, { timestamps: true });

deliveryPartnerSchema.index({ location: '2dsphere' });

export default mongoose.model('DeliveryPartner', deliveryPartnerSchema);
