import mongoose from 'mongoose';

const screenshotEventSchema = new mongoose.Schema({
  snapId: { type: mongoose.Schema.Types.ObjectId, ref: 'Snap', required: true },
  byUserId: { type: String, required: true },
  eventType: { type: String, enum: ['screenshot', 'screen_record'], default: 'screenshot' },
  timestamp: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.model('ScreenshotEvent', screenshotEventSchema);
