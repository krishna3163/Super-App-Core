import mongoose from 'mongoose';

const miniAppSchema = new mongoose.Schema({
  appId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  description: { type: String },
  icon: { type: String },
  developerId: { type: String, required: true },
  entryUrl: { type: String, required: true }, // The URL to load the mini app (e.g., a static site or bundle)
  category: { type: String, enum: ['utility', 'social', 'entertainment', 'shopping', 'productivity'], required: true },
  permissions: [String], // e.g., ['location', 'contacts', 'storage']
  status: { type: String, enum: ['active', 'inactive', 'under_review'], default: 'under_review' },
}, { timestamps: true });

export default mongoose.model('MiniApp', miniAppSchema);
