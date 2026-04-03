import mongoose from 'mongoose';

const subscriptionSchema = new mongoose.Schema({
  subscriberId: { type: String, required: true },
  creatorId: { type: String, required: true },
  tier: { type: String, enum: ['basic', 'premium', 'vip'], default: 'basic' },
  price: { type: Number, required: true },
  currency: { type: String, default: 'INR' },
  status: { type: String, enum: ['active', 'cancelled', 'expired', 'paused'], default: 'active' },
  startDate: { type: Date, default: Date.now },
  nextBillingDate: { type: Date },
  cancelledAt: { type: Date },
  perks: [String],
  autoRenew: { type: Boolean, default: true }
}, { timestamps: true });

subscriptionSchema.index({ subscriberId: 1, creatorId: 1 }, { unique: true });
subscriptionSchema.index({ creatorId: 1, status: 1 });

export default mongoose.model('Subscription', subscriptionSchema);
