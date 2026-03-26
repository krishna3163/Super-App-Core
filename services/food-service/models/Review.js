import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String },
}, { timestamps: true });

export default mongoose.model('Review', reviewSchema);
