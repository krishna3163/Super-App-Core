import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
  restaurantName: { type: String, default: '' },
  items: [{
    name: String,
    price: Number,
    quantity: Number,
    image: String
  }],
  total: { type: Number, required: true },
  shippingAddress: {
    name: String,
    phone: String,
    address: String
  },
  paymentMethod: { type: String, enum: ['upi', 'card', 'cod', 'bank', 'wallet'], default: 'cod' },
  status: { 
    type: String, 
    enum: ['placed', 'confirmed', 'preparing', 'on_the_way', 'delivered', 'cancelled'], 
    default: 'placed' 
  },
  estimatedTime: { type: String, default: '30-45 min' },
  deliveryPartnerId: { type: String },
  // Order chat between user and restaurant
  orderChat: [{
    senderId: String,
    senderName: String,
    message: String,
    createdAt: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

export default mongoose.model('FoodOrder', orderSchema);
