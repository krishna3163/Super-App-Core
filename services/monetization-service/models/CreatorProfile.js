import mongoose from 'mongoose';

const creatorProfileSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  displayName: { type: String },
  bio: { type: String, default: '' },
  avatar: { type: String, default: '' },
  coverImage: { type: String, default: '' },
  category: { type: String, enum: ['music', 'art', 'gaming', 'education', 'comedy', 'tech', 'fitness', 'cooking', 'lifestyle', 'other'], default: 'other' },
  subscriptionTiers: [{
    name: { type: String, enum: ['basic', 'premium', 'vip'] },
    price: { type: Number },
    description: String,
    perks: [String],
    isActive: { type: Boolean, default: true }
  }],
  totalSubscribers: { type: Number, default: 0 },
  totalEarnings: { type: Number, default: 0 },
  monthlyEarnings: { type: Number, default: 0 },
  badges: [{ name: String, icon: String, earnedAt: Date }],
  isVerified: { type: Boolean, default: false },
  isPremium: { type: Boolean, default: false },
  payoutMethod: { type: String, enum: ['upi', 'bank', 'wallet'], default: 'wallet' },
  payoutDetails: { upiId: String, bankAccount: String, ifsc: String },
  socialLinks: { youtube: String, instagram: String, twitter: String, website: String }
}, { timestamps: true });

export default mongoose.model('CreatorProfile', creatorProfileSchema);
