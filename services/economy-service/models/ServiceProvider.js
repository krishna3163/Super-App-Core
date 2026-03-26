import mongoose from 'mongoose';

const serviceProviderSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  title: { type: String, required: true }, // e.g., "Electrician", "Web Developer"
  category: { 
    type: String, 
    enum: ['electrician', 'plumber', 'developer', 'designer', 'teacher', 'other'], 
    required: true 
  },
  skills: [{ type: String }],
  experienceYears: { type: Number, default: 0 },
  pricing: { 
    rate: { type: Number, required: true },
    type: { type: String, enum: ['hourly', 'fixed'], default: 'hourly' }
  },
  location: {
    type: { type: String, default: 'Point' },
    coordinates: [Number] // [longitude, latitude]
  },
  rating: { type: Number, default: 5 },
  reviewCount: { type: Number, default: 0 }
}, { timestamps: true });

serviceProviderSchema.index({ location: '2dsphere' });
serviceProviderSchema.index({ title: 'text', category: 'text' });

export default mongoose.model('ServiceProvider', serviceProviderSchema);
