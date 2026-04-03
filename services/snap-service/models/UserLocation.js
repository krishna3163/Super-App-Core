import mongoose from 'mongoose';

const userLocationSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  location: {
    latitude: Number,
    longitude: Number,
    updatedAt: { type: Date, default: Date.now }
  },
  ghostMode: { type: Boolean, default: false },
  visibility: {
    type: String,
    enum: ['everyone', 'friends', 'selected_friends'],
    default: 'friends'
  },
  selectedFriendIds: [String]
}, { timestamps: true });

export default mongoose.model('UserLocation', userLocationSchema);
