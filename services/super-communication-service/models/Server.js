import mongoose from 'mongoose';

const serverSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, default: '' },
  icon: { type: String, default: '' },
  banner: { type: String, default: '' },
  ownerId: { type: String, required: true },
  
  categories: [{
    name: { type: String, required: true },
    position: { type: Number, default: 0 }
  }],
  
  members: [{
    userId: { type: String, required: true },
    roles: [{ type: String }],
    joinedAt: { type: Date, default: Date.now },
    nickname: { type: String, default: '' }
  }],
  
  roles: [{
    name: { type: String, required: true },
    color: { type: String, default: '#99aab5' },
    permissions: [{ type: String }]
  }],
  
  inviteCode: { type: String, unique: true },
  isPublic: { type: Boolean, default: false },
  systemChannelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Channel' }, // For welcome messages etc
  boostTier: { type: Number, default: 0 },
  boostCount: { type: Number, default: 0 },
  
  customEmojis: [{
    name: { type: String },
    url: { type: String },
    addedBy: { type: String }
  }]
}, { timestamps: true });

serverSchema.index({ inviteCode: 1 });

export default mongoose.model('Server', serverSchema);
