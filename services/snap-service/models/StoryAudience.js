import mongoose from 'mongoose';

const storyAudienceSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  blockedUserIds: [String],
  trustedUserIds: [String], // "Close Friends" equivalent
  defaultVisibility: { 
    type: String, 
    enum: ['everyone', 'friends', 'trusted_only', 'private'], 
    default: 'friends' 
  }
}, { timestamps: true });

export default mongoose.model('StoryAudience', storyAudienceSchema);
