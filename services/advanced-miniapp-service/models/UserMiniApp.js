import mongoose from 'mongoose';

const userMiniAppSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  appId: { type: String, required: true },
  isPinned: { type: Boolean, default: false },
  lastOpened: { type: Date, default: Date.now },
  settings: { type: Object, default: {} }
}, { timestamps: true });

userMiniAppSchema.index({ userId: 1, appId: 1 }, { unique: true });

export default mongoose.model('UserMiniApp', userMiniAppSchema);
