import mongoose from 'mongoose';

const driverSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  vehicleInfo: {
    model: String,
    plateNumber: String,
    color: String,
    type: { type: String, enum: ['bike', 'car', 'auto'], default: 'car' }
  },
  status: { type: String, enum: ['online', 'offline', 'on_ride'], default: 'offline' },
  location: {
    type: { type: String, default: 'Point' },
    coordinates: [Number]
  },
  rating: { type: Number, default: 5 },
  totalRides: { type: Number, default: 0 }
}, { timestamps: true });

driverSchema.index({ location: '2dsphere' });

export default mongoose.model('Driver', driverSchema);
