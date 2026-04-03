import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  
  // Phase S2: Profile
  profile: {
    username: String,
    bio: String,
    avatar: String,
    links: {
      github: String,
      linkedin: String,
      website: String
    },
    theme: { type: String, enum: ['light', 'dark', 'system'], default: 'system' },
    language: { type: String, default: 'en' }
  },

  // Phase S3: Privacy
  privacy: {
    profileVisibility: { type: String, enum: ['public', 'private'], default: 'public' },
    lastSeenVisibility: { type: Boolean, default: true },
    readReceipts: { type: Boolean, default: true },
    whoCanMessage: { type: String, enum: ['everyone', 'friends'], default: 'everyone' },
    blockedUsers: [String] // Array of userIds
  },

  // Phase S4: Notifications
  notifications: {
    pushEnabled: { type: Boolean, default: true },
    emailEnabled: { type: Boolean, default: true },
    categories: {
      messages: { type: Boolean, default: true },
      likes: { type: Boolean, default: true },
      comments: { type: Boolean, default: true },
      jobs: { type: Boolean, default: true },
      contests: { type: Boolean, default: true },
      orders: { type: Boolean, default: true },
      rides: { type: Boolean, default: true }
    }
  },

  // Phase S5: Chat
  chat: {
    autoDownloadMedia: { type: Boolean, default: true },
    fontSize: { type: Number, default: 14 },
    wallpaper: String,
    mutedChats: [String] // Array of chatIds
  },

  // Phase S6: Coding
  coding: {
    contestReminder: { type: Boolean, default: true },
    preferredPlatforms: [String], // ['Codeforces', 'LeetCode']
    dailyGoal: { type: Number, default: 1 },
    streakReminder: { type: Boolean, default: true }
  },

  // Phase S7: Marketplace
  marketplace: {
    defaultLocation: {
      address: String,
      coordinates: [Number]
    },
    currency: { type: String, default: 'USD' },
    paymentMethods: {
      upiId: String
    },
    sellerMode: { type: Boolean, default: false }
  },

  // Phase S8: Ride + Delivery
  rideDelivery: {
    mode: { type: String, enum: ['user', 'driver', 'both'], default: 'user' },
    vehicleDetails: {
      model: String,
      plate: String
    },
    availabilityStatus: { type: String, enum: ['online', 'offline'], default: 'offline' },
    deliveryMode: { type: Boolean, default: false }
  },

  // Phase S9: Dating
  dating: {
    ageRange: { min: { type: Number, default: 18 }, max: { type: Number, default: 35 } },
    distance: { type: Number, default: 50 }, // km
    interests: [String],
    showProfile: { type: Boolean, default: true }
  },

  // Phase S10: Mini App
  miniApps: {
    pinnedApps: [String], // Array of appIds
    recentApps: [String],
    permissions: [{
      appId: String,
      allowed: [String]
    }]
  },

  // Phase S11: Security
  security: {
    twoFactorAuth: { type: Boolean, default: false },
    activeSessions: [{
      deviceId: String,
      deviceType: String,
      lastLogin: { type: Date, default: Date.now }
    }]
  },

  // Home Screen Layout Defaults
  homeScreen: {
    widgets: { type: [String], default: ['feed', 'reddit_feed', 'friend_suggestions', 'trending_tags', 'todo', 'marketplace_deals'] }
  }

}, { timestamps: true });

export default mongoose.model('Settings', settingsSchema);
