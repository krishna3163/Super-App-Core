import mongoose from 'mongoose';

const chatGameSchema = new mongoose.Schema({
  chatId: { type: String, required: true }, // Links to SuperChat ID
  gameType: { type: String, enum: ['truth_or_dare', 'spin_the_wheel', 'draw_and_guess', 'werewolf', 'heads_up', 'dumb_charades', 'movie_guess'], required: true },
  status: { type: String, enum: ['lobby', 'active', 'finished'], default: 'lobby' },
  gameState: { type: Object, default: {} }, // Dynamic state based on gameType
  players: [{ type: String }], // userIds
  winnerId: { type: String }
}, { timestamps: true });

export default mongoose.model('ChatGame', chatGameSchema);
