import mongoose from 'mongoose';

const leaderboardSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  userName: { type: String },
  avatar: { type: String, default: '' },
  gameType: { type: String, required: true, index: true },
  gamesPlayed: { type: Number, default: 0 },
  gamesWon: { type: Number, default: 0 },
  totalScore: { type: Number, default: 0 },
  highestScore: { type: Number, default: 0 },
  winStreak: { type: Number, default: 0 },
  bestWinStreak: { type: Number, default: 0 },
  rank: { type: String, enum: ['bronze', 'silver', 'gold', 'platinum', 'diamond', 'master'], default: 'bronze' },
  xp: { type: Number, default: 0 },
  level: { type: Number, default: 1 },
  achievements: [{
    name: String,
    description: String,
    unlockedAt: { type: Date, default: Date.now },
    icon: String
  }]
}, { timestamps: true });

leaderboardSchema.index({ gameType: 1, totalScore: -1 });
leaderboardSchema.index({ userId: 1, gameType: 1 }, { unique: true });

export default mongoose.model('Leaderboard', leaderboardSchema);
