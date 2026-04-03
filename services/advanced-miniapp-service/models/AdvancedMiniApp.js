import mongoose from 'mongoose';

const advancedMiniAppSchema = new mongoose.Schema({
  appId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  description: { type: String },
  icon: { type: String },
  category: { type: String, enum: ['weather', 'news', 'games', 'utilities', 'finance', 'other'], required: true },
  entryUrl: { type: String, required: true }, // The URL to load the mini app
  developer: {
    name: String,
    website: String
  },
  rating: { type: Number, default: 0 },
  installCount: { type: Number, default: 0 },
  status: { type: String, enum: ['active', 'beta', 'inactive'], default: 'active' }
}, { timestamps: true });

export default mongoose.model('AdvancedMiniApp', advancedMiniAppSchema);
