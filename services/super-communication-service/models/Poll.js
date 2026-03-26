import mongoose from 'mongoose';

const pollSchema = new mongoose.Schema({
  targetId: { type: String, required: true }, // Chat or Group ID
  creatorId: { type: String, required: true },
  question: { type: String, required: true },
  options: [{
    id: { type: String, required: true },
    text: { type: String, required: true },
    votes: [{ type: String }] // userIds
  }],
  allowMultiple: { type: Boolean, default: false },
  isAnonymous: { type: Boolean, default: false },
  showResults: { type: String, enum: ['always', 'after_vote', 'never'], default: 'always' },
  expiresAt: { type: Date }
}, { timestamps: true });

export default mongoose.model('Poll', pollSchema);
