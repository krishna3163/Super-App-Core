import express from 'express';
import chatController from '../controllers/chatController.js';

const router = express.Router();

router.post('/', chatController.accessChat);
router.get('/', chatController.fetchChats);
router.post('/group', chatController.createGroupChat);

export default router;
