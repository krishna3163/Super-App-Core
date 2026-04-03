import mongoose from 'mongoose';

const swipeSchema = new mongoose.Schema({
  swiperId: { type: String, required: true },
  swipedId: { type: String, required: true },
  type: { type: String, enum: ['like', 'pass', 'super_like'], required: true },
  isRewound: { type: Boolean, default: false }
}, { timestamps: true });

// Prevent duplicate swipes (unless one was rewound)
swipeSchema.index({ swiperId: 1, swipedId: 1 }, { unique: true });

export default mongoose.model('Swipe', swipeSchema);
