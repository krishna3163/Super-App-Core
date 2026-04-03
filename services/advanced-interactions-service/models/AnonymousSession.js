import mongoose from 'mongoose';

const anonymousSessionSchema = new mongoose.Schema({
  users: [{
    userId: String,
    tempName: String, 
    liked: { type: Boolean, default: null }, 
    interests: [{ type: String }],
    wantsToReveal: { type: Boolean, default: false } // identity reveal request
  }],
  commonInterests: [{ type: String }], 
  status: { type: String, enum: ['waiting', 'active', 'finished'], default: 'waiting' },
  mode: { type: String, enum: ['random_chat', 'micro_dating'], default: 'random_chat' },
  
  // Audio/Video signaling setup (WebRTC support)
  webrtcReady: { type: Boolean, default: false },
  
  // Interactive Games (TicTacToe, Truth or Dare)
  activeGame: {
    type: { type: String, enum: ['none', 'tictactoe', 'truth_or_dare'], default: 'none' },
    state: { type: mongoose.Schema.Types.Mixed, default: {} },
    turn: { type: String } // userId
  },

  startedAt: { type: Date },
  expiresAt: { type: Date }, 
  
  chatHistory: [{
    senderId: String,
    message: String,
    translatedText: { type: Map, of: String }, // e.g {"hi": "The translation"}
    isBlurred: { type: Boolean, default: false }, // AI NSFW check
    isIcebreaker: { type: Boolean, default: false },
    timestamp: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

export default mongoose.model('AnonymousSession', anonymousSessionSchema);
