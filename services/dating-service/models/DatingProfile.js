import mongoose from 'mongoose';

const datingProfileSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  age: { type: Number, required: true },
  gender: { type: String, enum: ['male', 'female', 'other'], required: true },
  bio: { type: String },
  interests: [String],
  photos: [String],
  location: {
    type: { type: String, default: 'Point' },
    coordinates: { type: [Number], index: '2dsphere' }
  },
  preferences: {
    minAge: { type: Number, default: 18 },
    maxAge: { type: Number, default: 50 },
    gender: { type: String }
  }
}, { timestamps: true });

export default mongoose.model('DatingProfile', datingProfileSchema);
