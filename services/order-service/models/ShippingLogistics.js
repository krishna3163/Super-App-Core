import mongoose from 'mongoose';

const shippingLogisticsSchema = new mongoose.Schema({
  orderId: { type: String, required: true, unique: true },
  businessId: { type: String, required: true },
  buyerId: { type: String, required: true },
  
  courierCompany: { type: String, default: 'SuperApp Logistics' },
  trackingNumber: { type: String, unique: true },
  
  originAddress: {
    street: String, city: String, state: String, zipCode: String, country: String
  },
  destinationAddress: {
    street: String, city: String, state: String, zipCode: String, country: String
  },
  
  // Realtime Live Location tracking (Uber style for parcels)
  currentLocation: {
    latitude: Number,
    longitude: Number,
    lastUpdated: { type: Date, default: Date.now }
  },
  
  status: { 
    type: String, 
    enum: ['pending_pickup', 'in_transit', 'out_for_delivery', 'delivered', 'returned'], 
    default: 'pending_pickup' 
  },
  
  estimatedDeliveryDate: { type: Date },
  actualDeliveryDate: { type: Date }
  
}, { timestamps: true });

export default mongoose.model('ShippingLogistics', shippingLogisticsSchema);
