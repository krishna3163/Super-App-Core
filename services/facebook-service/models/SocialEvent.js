import mongoose from 'mongoose';

const socialEventSchema = new mongoose.Schema({
  creatorId: { type: String, required: true },
  creatorName: { type: String },
  title: { type: String, required: true },
  description: { type: String },
  coverImage: { type: String, default: '' },
  category: { type: String, enum: ['party', 'meetup', 'conference', 'workshop', 'concert', 'sports', 'charity', 'other'], default: 'meetup' },
  startDate: { type: Date, required: true },
  endDate: { type: Date },
  location: {
    name: { type: String },
    address: { type: String },
    lat: { type: Number },
    lon: { type: Number },
    isOnline: { type: Boolean, default: false },
    meetLink: { type: String }
  },
  privacy: { type: String, enum: ['public', 'friends', 'invite_only'], default: 'public' },
  rsvps: [{
    userId: String,
    userName: String,
    status: { type: String, enum: ['going', 'interested', 'not_going'] },
    respondedAt: { type: Date, default: Date.now }
  }],
  goingCount: { type: Number, default: 0 },
  interestedCount: { type: Number, default: 0 },
  maxAttendees: { type: Number },
  ticketPrice: { type: Number, default: 0 },
  isRecurring: { type: Boolean, default: false },
  recurringPattern: { type: String },
  tags: [String],
  discussion: [{
    userId: String,
    userName: String,
    message: String,
    createdAt: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

socialEventSchema.index({ startDate: 1, privacy: 1 });

export default mongoose.model('SocialEvent', socialEventSchema);
