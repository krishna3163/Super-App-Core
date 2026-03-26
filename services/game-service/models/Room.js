import mongoose from 'mongoose';

const playerSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  name: { type: String, required: true },
  score: { type: Number, default: 0 },
  isDrawing: { type: Boolean, default: false },
});

const roomSchema = new mongoose.Schema({
  roomCode: { type: String, required: true, unique: true },
  players: [playerSchema],
  maxPlayers: { type: Number, default: 8 },
  currentRound: { type: Number, default: 0 },
  totalRounds: { type: Number, default: 3 },
  status: { type: String, enum: ['waiting', 'playing', 'finished'], default: 'waiting' },
  currentWord: { type: String },
  timer: { type: Number, default: 60 },
}, { timestamps: true });

export default mongoose.model('Room', roomSchema);
