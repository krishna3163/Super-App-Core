import express from 'express';
import randomChatController from '../controllers/randomChatController.js';

const router = express.Router();

// Matchmaking & Polling
router.post('/match', randomChatController.requestMatch);
router.post('/skip', randomChatController.skipSession);
router.post('/choice', randomChatController.submitMicroDatingChoice);
router.get('/:sessionId', randomChatController.checkSessionStatus);

// Messaging & Core
router.post('/message', randomChatController.sendMessage);

// Brand new Omegle interactive features
router.post('/reveal', randomChatController.revealIdentity);
router.post('/icebreaker', randomChatController.triggerIcebreaker);
router.post('/game/start', randomChatController.startMiniGame);

export default router;
