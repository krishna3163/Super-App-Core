import mongoose from 'mongoose';

const b2bProductSchema = new mongoose.Schema({
  sellerId: { type: String, required: true }, // The Business
  productName: { type: String, required: true },
  description: { type: String },
  category: { type: String },
  basePrice: { type: Number, required: true },
  currency: { type: String, default: 'USD' },
  inStock: { type: Number, required: true },
  
  // B2B Specific Configuration (Alibaba / Indiamart clone features)
  moq: { type: Number, default: 100 }, // Minimum Order Quantity
  bulkPricing: [{
    minQuantity: Number, // E.g., at 500 units
    pricePerUnit: Number // Price per unit drops to $15
  }], // E.g., Array of discounts for huge orders
  shippingTerms: { type: String, default: 'FOB' },
  leadTimeDays: { type: Number, default: 7 }
}, { timestamps: true });

export default mongoose.model('B2BProduct', b2bProductSchema);
