import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  vendorId: { type: String, default: '' }, // seller/vendor userId
  items: [{
    productId: { type: String, required: true },
    name: { type: String, default: '' },
    image: { type: String, default: '' },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
    discount: { type: Number, default: 0 }
  }],
  status: { 
    type: String, 
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'out_for_delivery', 'delivered', 'cancelled', 'returned'],
    default: 'pending'
  },
  totalAmount: { type: Number, required: true },
  tax: { type: Number, default: 0 },
  shippingCost: { type: Number, default: 40 },
  shippingAddress: {
    name: String,
    phone: String,
    addressLine1: String,
    addressLine2: String,
    city: String,
    state: String,
    country: String,
    pincode: String
  },
  paymentMethod: { type: String, enum: ['upi', 'card', 'wallet', 'cod', 'bank'], default: 'cod' },
  paymentId: { type: String },
  tracking: {
    estimatedDelivery: Date,
    currentLocation: String,
    events: [{
      status: String,
      timestamp: { type: Date, default: Date.now },
      location: String,
      description: String
    }]
  },
  // Vendor-user chat messages on this order
  orderChat: [{
    senderId: String,
    senderName: String,
    message: String,
    createdAt: { type: Date, default: Date.now }
  }],
  deliveredAt: { type: Date }
}, { timestamps: true });

export default mongoose.model('Order', orderSchema);
