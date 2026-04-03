import mongoose from 'mongoose';

const roomSchema = new mongoose.Schema({
  roomCode: { type: String, required: true, unique: true },
  gameType: { type: String, enum: ['skribbl', 'trivia', 'word_chain', 'tic_tac_toe', 'chess', 'ludo', 'cards'], required: true },
  host: { type: String, required: true },
  hostName: { type: String },
  players: [{
    userId: String,
    userName: String,
    avatar: String,
    score: { type: Number, default: 0 },
    isDrawing: { type: Boolean, default: false },
    isReady: { type: Boolean, default: false },
    isConnected: { type: Boolean, default: true },
    joinedAt: { type: Date, default: Date.now }
  }],
  maxPlayers: { type: Number, default: 8 },
  status: { type: String, enum: ['waiting', 'playing', 'round_end', 'finished'], default: 'waiting' },
  settings: {
    rounds: { type: Number, default: 3 },
    drawTime: { type: Number, default: 80 }, // seconds
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
    category: { type: String, default: 'general' },
    isPrivate: { type: Boolean, default: false },
    language: { type: String, default: 'en' }
  },
  currentRound: { type: Number, default: 0 },
  totalRounds: { type: Number, default: 3 },
  currentWord: { type: String },
  currentHint: { type: String },
  currentDrawer: { type: String },
  usedWords: [String],
  roundStartedAt: { type: Date },
  chat: [{
    userId: String,
    userName: String,
    message: String,
    isCorrectGuess: { type: Boolean, default: false },
    timestamp: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

export default mongoose.model('Room', roomSchema);
