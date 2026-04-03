import mongoose from 'mongoose';

const adCampaignSchema = new mongoose.Schema({
  businessId: { type: String, required: true },
  title: { type: String, required: true },
  objective: { type: String, enum: ['brand_awareness', 'clicks', 'sales'], default: 'clicks' },
  targetAudience: {
    ageRange: { min: Number, max: Number },
    locations: [String],
    interests: [String]
  },
  dailyBudget: { type: Number, required: true },
  startDate: { type: Date, default: Date.now },
  endDate: { type: Date }, // Optional continuous
  status: { type: String, enum: ['active', 'paused', 'completed'], default: 'active' },
  creatives: [String], // S3 Image/Video URLs
  analytics: {
    impressions: { type: Number, default: 0 },
    clicks: { type: Number, default: 0 },
    spend: { type: Number, default: 0 }
  }
}, { timestamps: true });

export default mongoose.model('AdCampaign', adCampaignSchema);
