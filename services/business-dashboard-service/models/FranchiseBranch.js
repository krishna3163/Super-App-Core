import mongoose from 'mongoose';

const franchiseBranchSchema = new mongoose.Schema({
  parentBusinessId: { type: String, required: true }, // The main corporate entity (e.g. McDonald's Global)
  branchName: { type: String, required: true }, // e.g. "McDonald's - Times Square"
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  location: {
    latitude: Number,
    longitude: Number
  },
  managerId: { type: String }, // Super App userId of the branch manager
  isActive: { type: Boolean, default: true },
  localPricingModifier: { type: Number, default: 1.0 }, // If this branch is 10% more expensive, e.g. 1.1
  inventorySyncEnabled: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.model('FranchiseBranch', franchiseBranchSchema);
