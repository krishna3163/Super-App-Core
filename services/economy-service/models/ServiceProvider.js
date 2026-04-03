import mongoose from 'mongoose';

const serviceProviderSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  displayName: { type: String, required: true },
  avatar: { type: String, default: '' },
  bio: { type: String, default: '' },
  skills: [String],
  languages: [{ language: String, proficiency: { type: String, enum: ['basic', 'conversational', 'fluent', 'native'] } }],
  education: [{ institution: String, degree: String, year: Number }],
  certifications: [{ name: String, issuer: String, year: Number, url: String }],
  portfolio: [{
    title: String,
    description: String,
    images: [String],
    link: String,
    category: String
  }],
  rating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },
  completedGigs: { type: Number, default: 0 },
  responseTime: { type: String, default: '1 hour' },
  onTimeDelivery: { type: Number, default: 100 },
  memberSince: { type: Date, default: Date.now },
  level: { type: String, enum: ['new', 'level_1', 'level_2', 'top_rated', 'pro'], default: 'new' },
  totalEarnings: { type: Number, default: 0 },
  isOnline: { type: Boolean, default: false },
  lastActive: { type: Date, default: Date.now },
  location: { city: String, state: String, country: { type: String, default: 'India' } },
  isVerified: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

serviceProviderSchema.index({ skills: 1 });
serviceProviderSchema.index({ rating: -1, completedGigs: -1 });

export default mongoose.model('ServiceProvider', serviceProviderSchema);
