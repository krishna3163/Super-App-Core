import mongoose from 'mongoose';

const earningSchema = new mongoose.Schema({
  driverId: { type: String, required: true },
  rideId: { type: mongoose.Schema.Types.ObjectId, ref: 'AdvancedRide', required: true },
  amount: { type: Number, required: true },
  date: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.model('Earning', earningSchema);
