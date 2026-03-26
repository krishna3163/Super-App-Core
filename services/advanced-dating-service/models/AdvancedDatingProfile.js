import mongoose from 'mongoose';

const profileSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  age: { type: Number, required: true },
  gender: { type: String, required: true },
  interestedIn: { type: String, required: true },
  bio: { type: String },
  prompts: [{
    question: String,
    answer: String
  }],
  interests: [String],
  photos: [String],
  location: {
    type: { type: String, default: 'Point' },
    coordinates: [Number]
  },
  boostedUntil: { type: Date },
  superLikeCount: { type: Number, default: 5 },
  isPremium: { type: Boolean, default: false }
}, { timestamps: true });

profileSchema.index({ location: '2dsphere' });

export default mongoose.model('AdvancedDatingProfile', profileSchema);
