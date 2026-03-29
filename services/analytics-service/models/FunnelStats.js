import mongoose from 'mongoose';

const funnelStatsSchema = new mongoose.Schema({
  businessId: { type: String, required: true },
  metricType: { type: String, enum: ['clicks', 'views', 'conversions', 'cart_abandonment'], required: true },
  value: { type: Number, default: 0 },
  dateRecord: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.model('FunnelStats', funnelStatsSchema);
