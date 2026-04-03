import mongoose from 'mongoose';

const userRoleModeSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  roles: [{
    type: String, 
    enum: ['buyer', 'seller', 'rider', 'driver', 'customer', 'provider'],
    required: true
  }],
  activeRole: { 
    type: String, 
    enum: ['buyer', 'seller', 'rider', 'driver', 'customer', 'provider'],
    default: 'buyer' 
  }
}, { timestamps: true });

export default mongoose.model('UserRoleMode', userRoleModeSchema);
