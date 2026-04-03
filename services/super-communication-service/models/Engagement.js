import mongoose from 'mongoose';

// Combined Engagement Schema for Events, Reminders, Notices, and Alerts
const engagementSchema = new mongoose.Schema({
  targetId: { type: String, required: true }, // Chat or Group ID
  creatorId: { type: String, required: true },
  type: { type: String, enum: ['event', 'reminder', 'notice', 'alert'], required: true },
  
  // Common fields
  title: { type: String, required: true },
  description: { type: String },
  
  // Event & Reminder specific
  date: { type: Date },
  location: { type: String },
  rsvps: [{
    userId: String,
    status: { type: String, enum: ['going', 'not_going', 'maybe'], default: 'going' }
  }],
  
  // Notice & Alert specific
  isPinned: { type: Boolean, default: false },
  priority: { type: String, enum: ['normal', 'high', 'emergency'], default: 'normal' },
  
  expiresAt: { type: Date } // Auto-remove from banners
}, { timestamps: true });

export default mongoose.model('Engagement', engagementSchema);
