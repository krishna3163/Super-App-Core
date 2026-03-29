import mongoose from 'mongoose';

const datingProfileSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  age: { type: Number, required: true },
  gender: { type: String, enum: ['male', 'female', 'other'], required: true },
  interestedIn: { type: String, enum: ['male', 'female', 'other', 'everyone'], default: 'everyone' },
  bio: { type: String },
  prompts: [{
    question: String,
    answer: String
  }],
  interests: [String],
  photos: [String],
  location: {
    type: { type: String, default: 'Point' },
    coordinates: { type: [Number], index: '2dsphere' } // [longitude, latitude]
  },
  preferences: {
    minAge: { type: Number, default: 18 },
    maxAge: { type: Number, default: 50 },
    maxDistance: { type: Number, default: 50 } // in km
  },
  boostedUntil: { type: Date },
  superLikeCount: { type: Number, default: 5 },
  isPremium: { type: Boolean, default: false }
}, { timestamps: true });

datingProfileSchema.index({ location: '2dsphere' });

export default mongoose.model('DatingProfile', datingProfileSchema);
