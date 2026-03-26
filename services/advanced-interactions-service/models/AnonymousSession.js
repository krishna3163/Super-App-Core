import mongoose from 'mongoose';

const anonymousSessionSchema = new mongoose.Schema({
  users: [{
    userId: String,
    tempName: String,
    liked: { type: Boolean, default: null } // true: like, false: skip, null: undecided
  }],
  status: { type: String, enum: ['waiting', 'active', 'finished'], default: 'waiting' },
  mode: { type: String, enum: ['random_chat', 'micro_dating'], default: 'random_chat' },
  startedAt: { type: Date },
  expiresAt: { type: Date }, // Usually startedAt + 60 seconds
  chatHistory: [{
    senderId: String,
    message: String,
    timestamp: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

export default mongoose.model('AnonymousSession', anonymousSessionSchema);
