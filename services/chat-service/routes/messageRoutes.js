import express from 'express';
import messageController from '../controllers/messageController.js';

const router = express.Router();

router.post('/', messageController.sendMessage);
router.get('/:chatId', messageController.allMessages);
router.put('/react', messageController.reactToMessage);

export default router;
