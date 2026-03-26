import mongoose from 'mongoose';

const catalogSchema = new mongoose.Schema({
  businessId: { type: mongoose.Schema.Types.ObjectId, ref: 'BusinessProfile', required: true },
  name: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true },
  images: [String],
  inStock: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.model('BusinessCatalog', catalogSchema);
