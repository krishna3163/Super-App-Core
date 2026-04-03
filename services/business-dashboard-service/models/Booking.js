import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  businessId: { type: String, required: true },
  customerId: { type: String, required: true },
  serviceName: { type: String, required: true },
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' }, // Assigned staff
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  status: { type: String, enum: ['pending', 'confirmed', 'completed', 'cancelled'], default: 'pending' },
  paymentStatus: { type: String, enum: ['unpaid', 'paid', 'refunded'], default: 'unpaid' },
  price: { type: Number, required: true }
}, { timestamps: true });

export default mongoose.model('Booking', bookingSchema);
