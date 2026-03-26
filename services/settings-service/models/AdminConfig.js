import mongoose from 'mongoose';

const adminConfigSchema = new mongoose.Schema({
  featureFlags: {
    enableChat: { type: Boolean, default: true },
    enableRide: { type: Boolean, default: true },
    enableDating: { type: Boolean, default: true },
    enableCoding: { type: Boolean, default: true },
    enableMarketplace: { type: Boolean, default: true },
    enableFood: { type: Boolean, default: true }
  },
  maintenanceMode: { type: Boolean, default: false },
  minAppVersion: { type: String, default: '1.0.0' }
}, { timestamps: true });

export default mongoose.model('AdminConfig', adminConfigSchema);
