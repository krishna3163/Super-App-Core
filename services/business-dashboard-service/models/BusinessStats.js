import mongoose from 'mongoose';

const businessStatsSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  businessMode: { type: Boolean, default: false },
  roles: [{ type: String, enum: ['seller', 'driver', 'restaurant', 'hotel', 'provider'] }],
  
  // Daily analytics snapshot
  dailyStats: [{
    date: { type: Date, default: Date.now },
    views: { type: Number, default: 0 },
    clicks: { type: Number, default: 0 },
    earnings: { type: Number, default: 0 },
    orders: { type: Number, default: 0 }
  }],
  
  totalEarnings: { type: Number, default: 0 },
  totalOrders: { type: Number, default: 0 }
}, { timestamps: true });

export default mongoose.model('BusinessStats', businessStatsSchema);
