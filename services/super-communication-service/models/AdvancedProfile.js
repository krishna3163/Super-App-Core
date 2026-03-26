import mongoose from 'mongoose';

const advancedProfileSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  username: { type: String, required: true, unique: true },
  uniqueId: { type: String, required: true, unique: true }, // e.g., user_48291
  avatar: { type: String },
  bio: { type: String },
  location: { type: String },
  website: { type: String },
  
  // GitHub Style Markdown
  profileMarkdown: { type: String, default: '# Hello World\nWelcome to my profile.' },
  
  // Metrics
  followersCount: { type: Number, default: 0 },
  followingCount: { type: Number, default: 0 },
  connectionsCount: { type: Number, default: 0 },
  profileViews: { type: Number, default: 0 },
  
  // Phase N4: Dev Integration
  codingHandles: {
    leetcode: String,
    codeforces: String,
    codechef: String,
    gfg: String
  },

  // Phase N5: Project Showcase
  projects: [{
    title: { type: String, required: true },
    description: String,
    link: String,
    techStack: [String]
  }],

  // Visibility
  isPublic: { type: Boolean, default: true },
  whoCanView: { type: String, enum: ['everyone', 'followers', 'connections'], default: 'everyone' },
}, { timestamps: true });

// Text indices for fuzzy searching
advancedProfileSchema.index({ username: 'text', uniqueId: 'text' });

export default mongoose.model('AdvancedProfile', advancedProfileSchema);
