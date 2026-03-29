import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  eventType: { 
    type: String, 
    required: true,
    enum: ['page_view', 'click', 'purchase', 'signup', 'login', 'message_sent', 
           'post_created', 'ride_booked', 'food_ordered', 'match_made',
           'listing_created', 'search', 'app_open', 'app_close', 'error',
           'video_call', 'story_viewed', 'payment_made', 'review_posted',
           'profile_viewed', 'notification_clicked', 'share', 'custom'],
    index: true
  },
  category: { 
    type: String, 
    enum: ['engagement', 'commerce', 'social', 'communication', 'navigation', 'system', 'revenue'],
    default: 'engagement',
    index: true
  },
  properties: { type: mongoose.Schema.Types.Mixed, default: {} },
  sessionId: { type: String, index: true },
  page: { type: String },
  referrer: { type: String },
  device: {
    type: { type: String, enum: ['mobile', 'tablet', 'desktop'], default: 'mobile' },
    os: { type: String },
    browser: { type: String },
    screenWidth: { type: Number },
    screenHeight: { type: Number }
  },
  location: {
    city: { type: String },
    state: { type: String },
    country: { type: String, default: 'IN' },
    lat: { type: Number },
    lon: { type: Number }
  },
  duration: { type: Number, default: 0 }, // ms
  value: { type: Number, default: 0 }, // monetary value
  timestamp: { type: Date, default: Date.now, index: true }
}, { timestamps: true });

eventSchema.index({ userId: 1, eventType: 1, timestamp: -1 });
eventSchema.index({ category: 1, timestamp: -1 });

export default mongoose.model('AnalyticsEvent', eventSchema);
