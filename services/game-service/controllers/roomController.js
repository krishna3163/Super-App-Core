import Room from '../models/Room.js';
import Leaderboard from '../models/Leaderboard.js';
import crypto from 'crypto';

const WORD_BANK = {
  easy: ['cat', 'dog', 'sun', 'tree', 'fish', 'moon', 'rain', 'book', 'ball', 'cake', 'bird', 'star', 'cup', 'hat', 'car', 'bus', 'pen', 'key', 'box', 'bed', 'eye', 'ice', 'egg', 'ant', 'bat', 'cow', 'pig', 'fox', 'owl', 'bee'],
  medium: ['guitar', 'rocket', 'castle', 'dragon', 'wizard', 'pirate', 'anchor', 'bridge', 'camera', 'puzzle', 'knight', 'island', 'jungle', 'planet', 'sunset', 'robot', 'zombie', 'candle', 'temple', 'whale', 'spider', 'trophy', 'laptop', 'mirror', 'basket', 'ladder', 'circus', 'helmet', 'tunnel', 'palace'],
  hard: ['astronomy', 'avalanche', 'bluetooth', 'cafeteria', 'detective', 'earthquake', 'flamingo', 'generator', 'helicopter', 'invisible', 'jellyfish', 'kangaroo', 'labyrinth', 'microphone', 'nightmare', 'orchestra', 'parachute', 'quarantine', 'submarine', 'telescope', 'umbrella', 'vegetable', 'waterfall', 'xylophone', 'yachtsman', 'chandelier', 'trampoline', 'skateboard', 'photograph', 'strawberry']
};

const TRIVIA_QUESTIONS = [
  { question: 'What is the capital of India?', options: ['Mumbai', 'Delhi', 'Kolkata', 'Chennai'], answer: 1, category: 'geography' },
  { question: 'Which planet is known as the Red Planet?', options: ['Venus', 'Mars', 'Jupiter', 'Saturn'], answer: 1, category: 'science' },
  { question: 'Who created JavaScript?', options: ['James Gosling', 'Brendan Eich', 'Guido van Rossum', 'Dennis Ritchie'], answer: 1, category: 'tech' },
  { question: 'What is the largest ocean?', options: ['Atlantic', 'Indian', 'Arctic', 'Pacific'], answer: 3, category: 'geography' },
  { question: 'In which year did India gain independence?', options: ['1945', '1947', '1950', '1942'], answer: 1, category: 'history' },
  { question: 'What is the chemical symbol for Gold?', options: ['Go', 'Gd', 'Au', 'Ag'], answer: 2, category: 'science' },
  { question: 'Which company created React?', options: ['Google', 'Microsoft', 'Facebook', 'Apple'], answer: 2, category: 'tech' },
  { question: 'How many states are in India?', options: ['28', '29', '30', '27'], answer: 0, category: 'geography' },
  { question: 'What does CPU stand for?', options: ['Central Process Unit', 'Central Processing Unit', 'Computer Personal Unit', 'Central Program Unit'], answer: 1, category: 'tech' },
  { question: 'What is the smallest prime number?', options: ['0', '1', '2', '3'], answer: 2, category: 'math' },
  { question: 'Who painted the Mona Lisa?', options: ['Michelangelo', 'Da Vinci', 'Raphael', 'Donatello'], answer: 1, category: 'art' },
  { question: 'What language has the most native speakers?', options: ['English', 'Hindi', 'Mandarin', 'Spanish'], answer: 2, category: 'general' }
];

const getRandomWord = (difficulty = 'medium', usedWords = []) => {
  const words = WORD_BANK[difficulty] || WORD_BANK.medium;
  const available = words.filter(w => !usedWords.includes(w));
  if (available.length === 0) return words[Math.floor(Math.random() * words.length)];
  return available[Math.floor(Math.random() * available.length)];
};

const generateHint = (word) => {
  return word.split('').map((c, i) => (i === 0 || i === word.length - 1) ? c : '_').join(' ');
};

// Create room
export const createRoom = async (req, res) => {
  try {
    const { host, hostName, gameType, settings, avatar } = req.body;
    const roomCode = crypto.randomBytes(3).toString('hex').toUpperCase();
    const room = new Room({
      roomCode, host, hostName, gameType,
      settings: { ...settings },
      players: [{ userId: host, userName: hostName, avatar, isReady: true }]
    });
    await room.save();
    res.status(201).json({ status: 'success', data: room });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Join room
export const joinRoom = async (req, res) => {
  try {
    const { roomCode, userId, userName, avatar } = req.body;
    const room = await Room.findOne({ roomCode });
    if (!room) return res.status(404).json({ error: 'Room not found' });
    if (room.status !== 'waiting') return res.status(400).json({ error: 'Game already started' });
    if (room.players.length >= room.maxPlayers) return res.status(400).json({ error: 'Room is full' });
    if (room.players.some(p => p.userId === userId)) return res.status(400).json({ error: 'Already in room' });

    room.players.push({ userId, userName, avatar });
    await room.save();
    res.json({ status: 'success', data: room });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Start game
export const startGame = async (req, res) => {
  try {
    const room = await Room.findOne({ roomCode: req.params.roomCode });
    if (!room) return res.status(404).json({ error: 'Room not found' });
    if (room.players.length < 2) return res.status(400).json({ error: 'Need at least 2 players' });

    room.status = 'playing';
    room.currentRound = 1;
    room.totalRounds = room.settings.rounds * room.players.length;

    if (room.gameType === 'skribbl') {
      const word = getRandomWord(room.settings.difficulty, room.usedWords);
      room.currentWord = word;
      room.currentHint = generateHint(word);
      room.currentDrawer = room.players[0].userId;
      room.players[0].isDrawing = true;
      room.usedWords.push(word);
    }

    room.roundStartedAt = new Date();
    await room.save();
    res.json({ status: 'success', data: room });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Next round
export const nextRound = async (req, res) => {
  try {
    const room = await Room.findOne({ roomCode: req.params.roomCode });
    if (!room) return res.status(404).json({ error: 'Room not found' });

    room.currentRound += 1;
    if (room.currentRound > room.totalRounds) {
      room.status = 'finished';
      // Update leaderboard
      for (const player of room.players) {
        const isWinner = room.players.every(p => p.score <= player.score);
        await Leaderboard.findOneAndUpdate(
          { userId: player.userId, gameType: room.gameType },
          { 
            $inc: { gamesPlayed: 1, gamesWon: isWinner ? 1 : 0, totalScore: player.score, xp: player.score },
            $max: { highestScore: player.score },
            userName: player.userName, avatar: player.avatar
          },
          { upsert: true }
        );
      }
    } else if (room.gameType === 'skribbl') {
      // Rotate drawer
      room.players.forEach(p => p.isDrawing = false);
      const drawerIndex = (room.currentRound - 1) % room.players.length;
      room.players[drawerIndex].isDrawing = true;
      room.currentDrawer = room.players[drawerIndex].userId;
      const word = getRandomWord(room.settings.difficulty, room.usedWords);
      room.currentWord = word;
      room.currentHint = generateHint(word);
      room.usedWords.push(word);
      room.status = 'playing';
    }

    room.roundStartedAt = new Date();
    await room.save();
    res.json({ status: 'success', data: room });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get trivia question
export const getTriviaQuestion = async (req, res) => {
  try {
    const { category } = req.query;
    let questions = TRIVIA_QUESTIONS;
    if (category) questions = questions.filter(q => q.category === category);
    const question = questions[Math.floor(Math.random() * questions.length)];
    res.json({ status: 'success', data: { ...question, answer: undefined } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Check trivia answer
export const checkAnswer = async (req, res) => {
  try {
    const { questionIndex, selectedAnswer } = req.body;
    const question = TRIVIA_QUESTIONS[questionIndex];
    const correct = question && question.answer === selectedAnswer;
    res.json({ status: 'success', data: { correct, correctAnswer: question?.answer } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get room
export const getRoom = async (req, res) => {
  try {
    const room = await Room.findOne({ roomCode: req.params.roomCode });
    if (!room) return res.status(404).json({ error: 'Room not found' });
    res.json({ status: 'success', data: room });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get leaderboard
export const getLeaderboard = async (req, res) => {
  try {
    const { gameType = 'skribbl', page = 1, limit = 50 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const leaderboard = await Leaderboard.find({ gameType }).sort({ totalScore: -1 }).skip(skip).limit(parseInt(limit));
    res.json({ status: 'success', data: leaderboard });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get user stats
export const getUserStats = async (req, res) => {
  try {
    const stats = await Leaderboard.find({ userId: req.params.userId });
    res.json({ status: 'success', data: stats });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// List public rooms
export const listPublicRooms = async (req, res) => {
  try {
    const { gameType } = req.query;
    const filter = { status: 'waiting', 'settings.isPrivate': false };
    if (gameType) filter.gameType = gameType;
    const rooms = await Room.find(filter).sort({ createdAt: -1 }).limit(20);
    res.json({ status: 'success', data: rooms });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Leave room
export const leaveRoom = async (req, res) => {
  try {
    const { roomCode, userId } = req.body;
    const room = await Room.findOne({ roomCode });
    if (!room) return res.status(404).json({ error: 'Room not found' });
    room.players = room.players.filter(p => p.userId !== userId);
    if (room.players.length === 0) {
      await Room.deleteOne({ roomCode });
      return res.json({ status: 'success', message: 'Room deleted (empty)' });
    }
    if (room.host === userId) room.host = room.players[0].userId;
    await room.save();
    res.json({ status: 'success', data: room });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
