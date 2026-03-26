import mongoose from 'mongoose';

const advancedRideSchema = new mongoose.Schema({
  riderId: { type: String, required: true },
  driverId: { type: String },
  pickup: {
    address: String,
    location: { type: { type: String, default: 'Point' }, coordinates: [Number] }
  },
  drop: {
    address: String,
    location: { type: { type: String, default: 'Point' }, coordinates: [Number] }
  },
  status: { 
    type: String, 
    enum: ['requested', 'accepted', 'started', 'completed', 'cancelled'], 
    default: 'requested' 
  },
  fare: { type: Number },
  paymentStatus: { type: String, enum: ['pending', 'paid'], default: 'pending' },
  otp: { type: String },
}, { timestamps: true });

advancedRideSchema.index({ 'pickup.location': '2dsphere' });

export default mongoose.model('AdvancedRide', advancedRideSchema);
