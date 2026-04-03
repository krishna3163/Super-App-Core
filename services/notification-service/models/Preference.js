import mongoose from 'mongoose';

const preferenceSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  pushEnabled: { type: Boolean, default: true },
  emailEnabled: { type: Boolean, default: true },
  smsEnabled: { type: Boolean, default: false },
  doNotDisturb: {
    enabled: { type: Boolean, default: false },
    startTime: { type: String, default: '22:00' },
    endTime: { type: String, default: '08:00' }
  },
  channels: {
    likes: { push: { type: Boolean, default: true }, email: { type: Boolean, default: false } },
    comments: { push: { type: Boolean, default: true }, email: { type: Boolean, default: true } },
    follows: { push: { type: Boolean, default: true }, email: { type: Boolean, default: false } },
    messages: { push: { type: Boolean, default: true }, email: { type: Boolean, default: false } },
    orders: { push: { type: Boolean, default: true }, email: { type: Boolean, default: true } },
    payments: { push: { type: Boolean, default: true }, email: { type: Boolean, default: true } },
    promos: { push: { type: Boolean, default: false }, email: { type: Boolean, default: false } },
    system: { push: { type: Boolean, default: true }, email: { type: Boolean, default: true } }
  },
  mutedUsers: [String],
  mutedGroups: [String]
}, { timestamps: true });

export default mongoose.model('NotificationPreference', preferenceSchema);
