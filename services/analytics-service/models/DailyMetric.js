import mongoose from 'mongoose';

const dailyMetricSchema = new mongoose.Schema({
  date: { type: String, required: true, index: true }, // YYYY-MM-DD
  service: { type: String, required: true, index: true },
  metrics: {
    totalEvents: { type: Number, default: 0 },
    uniqueUsers: { type: Number, default: 0 },
    newUsers: { type: Number, default: 0 },
    activeUsers: { type: Number, default: 0 },
    sessions: { type: Number, default: 0 },
    avgSessionDuration: { type: Number, default: 0 }, // seconds
    pageViews: { type: Number, default: 0 },
    bounceRate: { type: Number, default: 0 },
    revenue: { type: Number, default: 0 },
    orders: { type: Number, default: 0 },
    messages: { type: Number, default: 0 },
    errors: { type: Number, default: 0 }
  },
  topPages: [{ page: String, views: Number }],
  topEvents: [{ event: String, count: Number }],
  userRetention: {
    day1: { type: Number, default: 0 },
    day7: { type: Number, default: 0 },
    day30: { type: Number, default: 0 }
  },
  deviceBreakdown: {
    mobile: { type: Number, default: 0 },
    tablet: { type: Number, default: 0 },
    desktop: { type: Number, default: 0 }
  },
  geoBreakdown: [{ city: String, count: Number }]
}, { timestamps: true });

dailyMetricSchema.index({ date: 1, service: 1 }, { unique: true });

export default mongoose.model('DailyMetric', dailyMetricSchema);
