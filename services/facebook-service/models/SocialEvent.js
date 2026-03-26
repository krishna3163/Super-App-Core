import mongoose from 'mongoose';

const socialEventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  creatorId: { type: String, required: true },
  date: { type: Date, required: true },
  location: { type: String },
  rsvps: [{
    userId: String,
    status: { type: String, enum: ['going', 'maybe', 'declined'], default: 'going' }
  }],
}, { timestamps: true });

export default mongoose.model('SocialEvent', socialEventSchema);
