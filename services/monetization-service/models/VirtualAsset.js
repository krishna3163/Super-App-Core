import mongoose from 'mongoose';

const virtualAssetSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  type: { type: String, enum: ['gift', 'boost', 'badge'], required: true },
  priceInCoins: { type: Number, required: true },
  imageUrl: String
}, { timestamps: true });

export default mongoose.model('VirtualAsset', virtualAssetSchema);
