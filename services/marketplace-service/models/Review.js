import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  userId: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String },
  images: [String],
  isVerifiedPurchase: { type: Boolean, default: false },
  helpfulVotes: [String], // userIds
  reportCount: { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.model('Review', reviewSchema);
