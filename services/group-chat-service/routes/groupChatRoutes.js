import express from 'express';
import * as groupChatController from '../controllers/groupChatController.js';

const router = express.Router();

router.post('/create', groupChatController.createGroup);
router.get('/user/:userId', groupChatController.getGroupsForUser);
router.post('/:groupId/add-member', groupChatController.addMember);
router.post('/:groupId/messages', groupChatController.sendMessage);
router.get('/:groupId/messages', groupChatController.getGroupMessages);

export default router;
