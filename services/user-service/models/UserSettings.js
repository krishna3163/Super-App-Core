import mongoose from 'mongoose';

const userSettingsSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true,
  },
  permissions: {
    camera: { type: String, enum: ['granted', 'denied', 'prompt', 'unavailable'], default: 'prompt' },
    microphone: { type: String, enum: ['granted', 'denied', 'prompt', 'unavailable'], default: 'prompt' },
    location: { type: String, enum: ['granted', 'denied', 'prompt', 'unavailable'], default: 'prompt' },
    notifications: { type: String, enum: ['granted', 'denied', 'prompt', 'unavailable'], default: 'prompt' },
    contacts: { type: String, enum: ['granted', 'denied', 'prompt', 'unavailable'], default: 'prompt' },
    storage: { type: String, enum: ['granted', 'denied', 'prompt', 'unavailable'], default: 'prompt' },
  },
  theme: { type: String, enum: ['light', 'dark', 'system'], default: 'system' },
  language: { type: String, default: 'en' },
  onboardingCompleted: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.model('UserSettings', userSettingsSchema);
