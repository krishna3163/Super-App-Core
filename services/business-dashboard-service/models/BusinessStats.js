import mongoose from 'mongoose';

const businessStatsSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  businessMode: { type: Boolean, default: false },
  businessName: { type: String, default: '' },
  businessType: { type: String, enum: ['seller', 'restaurant', 'driver', 'hotel', 'service_provider', 'creator'], default: 'seller' },
  roles: [{ type: String, enum: ['seller', 'driver', 'restaurant_owner', 'hotel_owner', 'service_provider', 'creator'] }],
  revenue: {
    today: { type: Number, default: 0 },
    thisWeek: { type: Number, default: 0 },
    thisMonth: { type: Number, default: 0 },
    total: { type: Number, default: 0 }
  },
  orders: {
    pending: { type: Number, default: 0 },
    inProgress: { type: Number, default: 0 },
    completed: { type: Number, default: 0 },
    cancelled: { type: Number, default: 0 },
    total: { type: Number, default: 0 }
  },
  customers: {
    total: { type: Number, default: 0 },
    returning: { type: Number, default: 0 },
    newThisMonth: { type: Number, default: 0 }
  },
  rating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },
  inventory: {
    totalProducts: { type: Number, default: 0 },
    lowStock: { type: Number, default: 0 },
    outOfStock: { type: Number, default: 0 }
  },
  dailyStats: [{
    date: String,
    revenue: { type: Number, default: 0 },
    orders: { type: Number, default: 0 },
    pageViews: { type: Number, default: 0 },
    newCustomers: { type: Number, default: 0 }
  }],
  topProducts: [{
    productId: String,
    name: String,
    sold: { type: Number, default: 0 },
    revenue: { type: Number, default: 0 }
  }],
  notifications: [{
    type: { type: String, enum: ['order', 'review', 'payment', 'alert', 'milestone'] },
    message: String,
    isRead: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
  }],
  settings: {
    autoAcceptOrders: { type: Boolean, default: false },
    notifyNewOrder: { type: Boolean, default: true },
    notifyLowStock: { type: Boolean, default: true },
    operatingHours: { start: String, end: String },
    isOnVacation: { type: Boolean, default: false }
  }
}, { timestamps: true });

export default mongoose.model('BusinessStats', businessStatsSchema);
