import mongoose from 'mongoose';

const employeeSchema = new mongoose.Schema({
  businessId: { type: String, required: true },
  userId: { type: String, required: true }, // Super app user ID
  role: { type: String, enum: ['manager', 'staff', 'admin'], default: 'staff' },
  shiftStart: { type: String, default: '09:00' }, // HH:mm
  shiftEnd: { type: String, default: '17:00' }, // HH:mm
  salaryConfig: {
    type: { type: String, enum: ['fixed', 'commission', 'hourly'], default: 'fixed' },
    amount: { type: Number, default: 0 }
  },
  available: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.model('Employee', employeeSchema);
