import express from 'express';
import { createRoom, joinRoom, startGame, nextRound, getRoom, getTriviaQuestion, checkAnswer, getLeaderboard, getUserStats, listPublicRooms, leaveRoom } from '../controllers/roomController.js';

const router = express.Router();

// Room management
router.post('/rooms', createRoom);
router.post('/rooms/join', joinRoom);
router.post('/rooms/leave', leaveRoom);
router.get('/rooms/public', listPublicRooms);
router.get('/rooms/:roomCode', getRoom);
router.post('/rooms/:roomCode/start', startGame);
router.post('/rooms/:roomCode/next-round', nextRound);

// Trivia
router.get('/trivia/question', getTriviaQuestion);
router.post('/trivia/check', checkAnswer);

// Leaderboard
router.get('/leaderboard', getLeaderboard);
router.get('/stats/:userId', getUserStats);

export default router;
