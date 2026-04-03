import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  type: { 
    type: String, 
    enum: ['like', 'comment', 'follow', 'mention', 'message', 'order', 'delivery', 'payment', 'ride', 'booking', 'system', 'promo', 'match', 'friend_request', 'group_invite', 'achievement', 'reminder'],
    required: true 
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  icon: { type: String, default: '' },
  image: { type: String, default: '' },
  data: {
    sourceId: String,
    sourceType: String,
    actionUrl: String,
    senderId: String,
    senderName: String,
    senderAvatar: String,
    metadata: mongoose.Schema.Types.Mixed
  },
  priority: { type: String, enum: ['low', 'normal', 'high', 'urgent'], default: 'normal' },
  channel: { type: String, enum: ['push', 'in_app', 'email', 'sms', 'all'], default: 'in_app' },
  isRead: { type: Boolean, default: false },
  readAt: { type: Date },
  isActioned: { type: Boolean, default: false },
  actionedAt: { type: Date },
  groupKey: { type: String }, // For grouping similar notifications
  expiresAt: { type: Date }
}, { timestamps: true });

notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, type: 1 });

export default mongoose.model('Notification', notificationSchema);
