import mongoose from 'mongoose';

const userProfileControlSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  isDeleted: { type: Boolean, default: false },
  deletedAt: { type: Date },
  isDisabled: { type: Boolean, default: false }, // Hidden from search/matchmaking
  disabledAt: { type: Date },
}, { timestamps: true });

export default mongoose.model('UserProfileControl', userProfileControlSchema);
