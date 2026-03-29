import mongoose from 'mongoose';

const rideSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  driverId: { type: String },
  pickup: {
    address: String,
    location: {
      type: { type: String, default: 'Point' },
      coordinates: [Number] // [longitude, latitude]
    }
  },
  drop: {
    address: String,
    location: {
      type: { type: String, default: 'Point' },
      coordinates: [Number] // [longitude, latitude]
    }
  },
  status: { 
    type: String, 
    enum: ['pending', 'searching', 'accepted', 'ongoing', 'completed', 'cancelled'], 
    default: 'pending' 
  },
  vehicleType: {
    type: String,
    enum: ['bike', 'auto', 'mini', 'sedan'],
    default: 'mini'
  },
  fare: { type: Number },
  distance: { type: String },
  duration: { type: String },
}, { timestamps: true });

rideSchema.index({ 'pickup.location': '2dsphere' });

export default mongoose.model('Ride', rideSchema);
