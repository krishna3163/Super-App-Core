import express from 'express';
import * as chatController from '../controllers/chatController.js';

const router = express.Router();

router.post('/access', chatController.accessChat);
router.post('/message', chatController.sendMessage);
router.patch('/message/edit', chatController.editMessage);
router.post('/message/react', chatController.addReaction);
router.post('/message/delete', chatController.deleteMessage);
router.delete('/message/view-once/:messageId', chatController.consumeViewOnce);
router.patch('/disappear', chatController.toggleDisappearingMessages);
router.get('/:chatId/messages', chatController.getChatMessages);
router.post('/read', chatController.markAsRead);

export default router;
