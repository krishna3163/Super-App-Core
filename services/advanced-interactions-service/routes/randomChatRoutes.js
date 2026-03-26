import express from 'express';
import * as randomChatController from '../controllers/randomChatController.js';

const router = express.Router();

router.post('/match', randomChatController.requestMatch);
router.post('/skip', randomChatController.skipSession);
router.post('/choice', randomChatController.submitMicroDatingChoice);

export default router;
