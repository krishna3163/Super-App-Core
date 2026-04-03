import mongoose from 'mongoose';

const loyaltyProgramSchema = new mongoose.Schema({
  businessId: { type: String, required: true, unique: true },
  programName: { type: String, default: 'VIP Rewards' },
  pointsPerDollar: { type: Number, default: 1 }, // E.g., 10 points for every $1 spent
  tiers: [{
    name: { type: String, required: true }, // E.g., Silver, Gold, Platinum
    pointsRequired: { type: Number, required: true },
    perks: [String] // E.g., ['Free Delivery', '10% Discount']
  }],
  customers: [{
    userId: { type: String, required: true },
    points: { type: Number, default: 0 },
    currentTier: { type: String, default: 'Silver' },
    joinedAt: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

export default mongoose.model('LoyaltyProgram', loyaltyProgramSchema);
