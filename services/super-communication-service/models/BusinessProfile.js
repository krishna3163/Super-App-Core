import mongoose from 'mongoose';

const businessProfileSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true }, // The user who owns the business
  businessName: { type: String, required: true },
  description: { type: String },
  logo: { type: String },
  category: { type: String },
  address: { type: String },
  workingHours: { type: Object }, // e.g., { monday: "09:00-17:00" }
  isVerified: { type: Boolean, default: false },
  quickReplies: [{
    shortcut: String,
    message: String
  }],
  autoMessages: {
    greeting: String,
    away: String,
    isAway: { type: Boolean, default: false }
  },
  labels: [{
    name: String,
    color: String,
    userIds: [String] // Customers categorized under this label
  }]
}, { timestamps: true });

export default mongoose.model('BusinessProfile', businessProfileSchema);
