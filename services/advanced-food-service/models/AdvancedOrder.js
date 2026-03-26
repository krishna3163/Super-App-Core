import mongoose from 'mongoose';

const advancedOrderSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: 'AdvancedRestaurant', required: true },
  items: [{
    name: String,
    price: Number,
    quantity: Number
  }],
  total: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['placed', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'], 
    default: 'placed' 
  },
  deliveryPartnerId: { type: String },
  deliveryLocation: {
    type: { type: String, default: 'Point' },
    coordinates: [Number]
  },
  deliveryCharge: { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.model('AdvancedOrder', advancedOrderSchema);
