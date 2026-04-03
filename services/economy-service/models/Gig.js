import mongoose from 'mongoose';

const gigSchema = new mongoose.Schema({
  providerId: { type: String, required: true, index: true },
  providerName: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { 
    type: String, required: true,
    enum: ['web_dev', 'mobile_dev', 'design', 'writing', 'marketing', 'video', 'music', 'data', 'ai', 'business', 'lifestyle', 'tutoring', 'translation', 'other'],
    index: true
  },
  subcategory: { type: String },
  tags: [String],
  packages: [{
    name: { type: String, enum: ['basic', 'standard', 'premium'] },
    title: { type: String },
    description: { type: String },
    price: { type: Number, required: true },
    deliveryDays: { type: Number, required: true },
    revisions: { type: Number, default: 1 },
    features: [String]
  }],
  images: [String],
  coverImage: { type: String, default: '' },
  requirements: [{ question: String, type: { type: String, enum: ['text', 'file', 'choice'] }, options: [String], required: Boolean }],
  faq: [{ question: String, answer: String }],
  rating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },
  ordersCompleted: { type: Number, default: 0 },
  ordersInQueue: { type: Number, default: 0 },
  impressions: { type: Number, default: 0 },
  clicks: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  isFeatured: { type: Boolean, default: false },
  status: { type: String, enum: ['draft', 'pending_review', 'active', 'paused', 'denied'], default: 'active' }
}, { timestamps: true });

gigSchema.index({ title: 'text', description: 'text', tags: 'text' });
gigSchema.index({ category: 1, rating: -1 });

export default mongoose.model('Gig', gigSchema);
